"""
Tests for Crowdwave batch processing.
"""

import unittest
import sys
import tempfile
import json
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine.batch import (
    BatchProcessor,
    BatchJob,
    BatchResult,
    run_batch_from_file,
)


class TestBatchProcessor(unittest.TestCase):
    """Test batch processing functionality."""
    
    def setUp(self):
        self.processor = BatchProcessor(max_workers=2)
    
    def test_add_job(self):
        """Should add jobs correctly."""
        self.processor.add_job(
            job_id="test_1",
            config={"audience": "US consumers", "geography": "USA"},
            questions=[{"id": "Q1", "text": "Test?", "type": "scale", "scale": [1, 5]}]
        )
        
        self.assertEqual(len(self.processor.jobs), 1)
        self.assertEqual(self.processor.jobs[0].job_id, "test_1")
    
    def test_run_single_job(self):
        """Should run a single job successfully."""
        self.processor.add_job(
            job_id="test_1",
            config={"audience": "US consumers", "geography": "USA"},
            questions=[{"id": "Q1", "text": "How satisfied?", "type": "scale", "scale": [1, 5]}]
        )
        
        results = self.processor.run(parallel=False)
        
        self.assertEqual(len(results), 1)
        self.assertTrue(results[0].success)
        self.assertIsNotNone(results[0].report)
        self.assertEqual(results[0].job_id, "test_1")
    
    def test_run_multiple_jobs(self):
        """Should run multiple jobs."""
        for i in range(3):
            self.processor.add_job(
                job_id=f"test_{i}",
                config={"audience": "US consumers", "geography": "USA"},
                questions=[{"id": "Q1", "text": "Satisfied?", "type": "scale", "scale": [1, 5]}]
            )
        
        results = self.processor.run(parallel=True)
        
        self.assertEqual(len(results), 3)
        self.assertTrue(all(r.success for r in results))
    
    def test_run_with_progress_callback(self):
        """Should call progress callback."""
        self.processor.add_job(
            job_id="test_1",
            config={"audience": "US consumers"},
            questions=[{"id": "Q1", "text": "Test?", "type": "binary", "options": ["Yes", "No"]}]
        )
        
        progress_calls = []
        def callback(completed, total):
            progress_calls.append((completed, total))
        
        self.processor.run(parallel=False, progress_callback=callback)
        
        self.assertEqual(len(progress_calls), 1)
        self.assertEqual(progress_calls[0], (1, 1))
    
    def test_summary(self):
        """Should generate correct summary."""
        for i in range(2):
            self.processor.add_job(
                job_id=f"test_{i}",
                config={"audience": "US consumers"},
                questions=[{"id": "Q1", "text": "Test?", "type": "scale", "scale": [1, 5]}]
            )
        
        results = self.processor.run()
        summary = self.processor.summary(results)
        
        self.assertEqual(summary["total_jobs"], 2)
        self.assertEqual(summary["successful"], 2)
        self.assertEqual(summary["failed"], 0)
        self.assertEqual(summary["success_rate"], 1.0)
    
    def test_export_csv(self):
        """Should export to CSV correctly."""
        self.processor.add_job(
            job_id="test_1",
            config={"audience": "US consumers"},
            questions=[{"id": "Q1", "text": "Satisfied?", "type": "scale", "scale": [1, 5]}],
            metadata={"campaign": "test_campaign"}
        )
        
        results = self.processor.run()
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            output_path = f.name
        
        try:
            self.processor.export_csv(results, output_path)
            
            # Verify file exists and has content
            self.assertTrue(os.path.exists(output_path))
            with open(output_path, 'r') as f:
                content = f.read()
                self.assertIn("job_id", content)
                self.assertIn("test_1", content)
                self.assertIn("meta_campaign", content)
        finally:
            os.unlink(output_path)
    
    def test_export_json(self):
        """Should export to JSON correctly."""
        self.processor.add_job(
            job_id="test_1",
            config={"audience": "US consumers"},
            questions=[{"id": "Q1", "text": "NPS?", "type": "nps"}]
        )
        
        results = self.processor.run()
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            output_path = f.name
        
        try:
            self.processor.export_json(results, output_path)
            
            with open(output_path, 'r') as f:
                data = json.load(f)
            
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["job_id"], "test_1")
            self.assertTrue(data[0]["success"])
        finally:
            os.unlink(output_path)
    
    def test_clear(self):
        """Should clear all jobs."""
        self.processor.add_job("test_1", {}, [])
        self.processor.add_job("test_2", {}, [])
        
        self.assertEqual(len(self.processor.jobs), 2)
        
        self.processor.clear()
        
        self.assertEqual(len(self.processor.jobs), 0)


class TestBatchFromFile(unittest.TestCase):
    """Test batch processing from file."""
    
    def test_load_jobs_from_file(self):
        """Should load jobs from JSON file."""
        jobs_data = [
            {
                "job_id": "survey_1",
                "config": {"audience": "US consumers"},
                "questions": [{"id": "Q1", "text": "Test?", "type": "scale", "scale": [1, 5]}]
            },
            {
                "job_id": "survey_2",
                "config": {"audience": "UK consumers"},
                "questions": [{"id": "Q1", "text": "Test?", "type": "binary", "options": ["Yes", "No"]}]
            }
        ]
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(jobs_data, f)
            input_path = f.name
        
        try:
            processor = BatchProcessor()
            processor.add_jobs_from_file(input_path)
            
            self.assertEqual(len(processor.jobs), 2)
            self.assertEqual(processor.jobs[0].job_id, "survey_1")
            self.assertEqual(processor.jobs[1].job_id, "survey_2")
        finally:
            os.unlink(input_path)
    
    def test_run_batch_from_file(self):
        """Should run batch from file and export results."""
        jobs_data = [
            {
                "job_id": "survey_1",
                "config": {"audience": "US consumers"},
                "questions": [{"id": "Q1", "text": "Satisfied?", "type": "scale", "scale": [1, 5]}]
            }
        ]
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(jobs_data, f)
            input_path = f.name
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            output_path = f.name
        
        try:
            summary = run_batch_from_file(input_path, output_path, format="csv")
            
            self.assertEqual(summary["total_jobs"], 1)
            self.assertEqual(summary["successful"], 1)
            self.assertTrue(os.path.exists(output_path))
        finally:
            os.unlink(input_path)
            os.unlink(output_path)


class TestBatchResult(unittest.TestCase):
    """Test BatchResult dataclass."""
    
    def test_batch_result_creation(self):
        """Should create BatchResult correctly."""
        result = BatchResult(
            job_id="test",
            success=True,
            report=None,
            error=None,
            duration_ms=100.5,
            metadata={"key": "value"}
        )
        
        self.assertEqual(result.job_id, "test")
        self.assertTrue(result.success)
        self.assertAlmostEqual(result.duration_ms, 100.5)
        self.assertEqual(result.metadata["key"], "value")


if __name__ == "__main__":
    unittest.main(verbosity=2)
