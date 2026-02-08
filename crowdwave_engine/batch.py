"""
Crowdwave Batch Processing
Efficiently run multiple simulations with parallel processing.
"""

import json
import csv
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time

from .crowdwave import CrowdwaveEngine, SimulationReport


@dataclass
class BatchJob:
    """A single simulation job in a batch."""
    job_id: str
    config: Dict
    questions: List[Dict]
    metadata: Dict = field(default_factory=dict)


@dataclass
class BatchResult:
    """Result of a batch job."""
    job_id: str
    success: bool
    report: Optional[SimulationReport]
    error: Optional[str]
    duration_ms: float
    metadata: Dict = field(default_factory=dict)


class BatchProcessor:
    """
    Process multiple survey simulations efficiently.
    
    Usage:
        processor = BatchProcessor()
        
        # Add jobs
        processor.add_job("survey_1", config1, questions1)
        processor.add_job("survey_2", config2, questions2)
        
        # Run all
        results = processor.run()
        
        # Export
        processor.export_csv(results, "output.csv")
    """
    
    def __init__(self, max_workers: int = 4):
        self.engine = CrowdwaveEngine()
        self.max_workers = max_workers
        self.jobs: List[BatchJob] = []
        
    def add_job(
        self,
        job_id: str,
        config: Dict,
        questions: List[Dict],
        metadata: Dict = None
    ):
        """Add a simulation job to the batch."""
        self.jobs.append(BatchJob(
            job_id=job_id,
            config=config,
            questions=questions,
            metadata=metadata or {}
        ))
    
    def add_jobs_from_file(self, file_path: str):
        """
        Load jobs from a JSON file.
        
        File format:
        [
            {
                "job_id": "survey_1",
                "config": {"audience": "...", ...},
                "questions": [...]
            },
            ...
        ]
        """
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        for item in data:
            self.add_job(
                job_id=item.get("job_id", f"job_{len(self.jobs)}"),
                config=item.get("config", {}),
                questions=item.get("questions", []),
                metadata=item.get("metadata", {})
            )
    
    def _run_job(self, job: BatchJob) -> BatchResult:
        """Run a single job."""
        start_time = time.time()
        
        try:
            report = self.engine.simulate(job.config, job.questions)
            duration_ms = (time.time() - start_time) * 1000
            
            return BatchResult(
                job_id=job.job_id,
                success=True,
                report=report,
                error=None,
                duration_ms=duration_ms,
                metadata=job.metadata
            )
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return BatchResult(
                job_id=job.job_id,
                success=False,
                report=None,
                error=str(e),
                duration_ms=duration_ms,
                metadata=job.metadata
            )
    
    def run(
        self,
        parallel: bool = True,
        progress_callback: Callable[[int, int], None] = None
    ) -> List[BatchResult]:
        """
        Run all jobs in the batch.
        
        Args:
            parallel: Use parallel processing (default True)
            progress_callback: Function called with (completed, total)
            
        Returns:
            List of BatchResult objects
        """
        results = []
        total = len(self.jobs)
        completed = 0
        
        if parallel and total > 1:
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(self._run_job, job): job 
                    for job in self.jobs
                }
                
                for future in as_completed(futures):
                    result = future.result()
                    results.append(result)
                    completed += 1
                    
                    if progress_callback:
                        progress_callback(completed, total)
        else:
            for job in self.jobs:
                result = self._run_job(job)
                results.append(result)
                completed += 1
                
                if progress_callback:
                    progress_callback(completed, total)
        
        # Sort by job_id for consistent ordering
        results.sort(key=lambda r: r.job_id)
        return results
    
    def export_csv(
        self,
        results: List[BatchResult],
        output_path: str,
        include_distributions: bool = True
    ):
        """
        Export batch results to CSV.
        
        Args:
            results: List of BatchResult objects
            output_path: Path to output CSV file
            include_distributions: Include full distributions (default True)
        """
        rows = []
        
        for result in results:
            if not result.success or not result.report:
                rows.append({
                    "job_id": result.job_id,
                    "success": False,
                    "error": result.error,
                    "duration_ms": result.duration_ms,
                })
                continue
            
            for qr in result.report.results:
                row = {
                    "job_id": result.job_id,
                    "success": True,
                    "duration_ms": result.duration_ms,
                    "question_id": qr.question_id,
                    "question_text": qr.question_text,
                    "mean": qr.mean,
                    "sd": qr.sd,
                    "confidence": qr.confidence,
                    "accuracy_zone": qr.accuracy_zone.value if hasattr(qr.accuracy_zone, 'value') else qr.accuracy_zone,
                    "biases": "|".join(qr.biases_detected or []),
                    "corrections": "|".join(qr.corrections_applied or []),
                }
                
                if include_distributions:
                    for key, value in qr.distribution.items():
                        row[f"dist_{key}"] = value
                
                # Add metadata
                for k, v in result.metadata.items():
                    row[f"meta_{k}"] = v
                
                rows.append(row)
        
        if not rows:
            return
        
        # Get all unique keys
        all_keys = set()
        for row in rows:
            all_keys.update(row.keys())
        
        # Order keys sensibly
        key_order = ["job_id", "success", "error", "duration_ms", "question_id", 
                     "question_text", "mean", "sd", "confidence", "accuracy_zone",
                     "biases", "corrections"]
        ordered_keys = [k for k in key_order if k in all_keys]
        ordered_keys.extend(sorted([k for k in all_keys if k not in key_order]))
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=ordered_keys)
            writer.writeheader()
            writer.writerows(rows)
    
    def export_json(
        self,
        results: List[BatchResult],
        output_path: str
    ):
        """Export batch results to JSON."""
        data = []
        
        for result in results:
            item = {
                "job_id": result.job_id,
                "success": result.success,
                "duration_ms": result.duration_ms,
                "metadata": result.metadata,
            }
            
            if result.error:
                item["error"] = result.error
            
            if result.report:
                item["results"] = []
                for qr in result.report.results:
                    item["results"].append({
                        "question_id": qr.question_id,
                        "question_text": qr.question_text,
                        "distribution": qr.distribution,
                        "mean": qr.mean,
                        "sd": qr.sd,
                        "confidence": qr.confidence,
                        "accuracy_zone": qr.accuracy_zone.value if hasattr(qr.accuracy_zone, 'value') else qr.accuracy_zone,
                        "biases_detected": qr.biases_detected,
                        "corrections_applied": qr.corrections_applied,
                    })
            
            data.append(item)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    def summary(self, results: List[BatchResult]) -> Dict:
        """Generate summary statistics for batch results."""
        total = len(results)
        successful = sum(1 for r in results if r.success)
        failed = total - successful
        
        durations = [r.duration_ms for r in results]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Count accuracy zones
        zones = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        total_questions = 0
        
        for result in results:
            if result.report:
                for qr in result.report.results:
                    total_questions += 1
                    zone = qr.accuracy_zone.value if hasattr(qr.accuracy_zone, 'value') else str(qr.accuracy_zone)
                    for z in zones:
                        if z in zone.upper():
                            zones[z] += 1
                            break
        
        return {
            "total_jobs": total,
            "successful": successful,
            "failed": failed,
            "success_rate": successful / total if total > 0 else 0,
            "total_questions": total_questions,
            "avg_duration_ms": avg_duration,
            "accuracy_zones": zones,
        }
    
    def clear(self):
        """Clear all jobs."""
        self.jobs = []


def run_batch_from_file(
    input_file: str,
    output_file: str,
    format: str = "csv"
) -> Dict:
    """
    Convenience function to run batch from file.
    
    Args:
        input_file: Path to JSON file with jobs
        output_file: Path to output file
        format: Output format (csv or json)
        
    Returns:
        Summary statistics
    """
    processor = BatchProcessor()
    processor.add_jobs_from_file(input_file)
    
    results = processor.run()
    
    if format == "csv":
        processor.export_csv(results, output_file)
    else:
        processor.export_json(results, output_file)
    
    return processor.summary(results)
