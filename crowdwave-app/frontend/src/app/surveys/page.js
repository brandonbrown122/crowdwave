'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ name: '', description: '', questions: [] });
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'scale' });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/surveys');
      setSurveys(await res.json());
    } catch (err) {
      console.error('Failed to load surveys');
    }
    setLoading(false);
  };

  const questionTypes = [
    { value: 'scale', label: 'Likert Scale (1-5)', icon: '📊' },
    { value: 'binary', label: 'Yes/No', icon: '✓✗' },
    { value: 'nps', label: 'NPS (0-10)', icon: '📈' },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
    { value: 'open_end', label: 'Open-Ended', icon: '💬' },
  ];

  const addQuestion = () => {
    if (newQuestion.text.trim()) {
      setNewSurvey(prev => ({
        ...prev,
        questions: [...prev.questions, { ...newQuestion, id: `Q${prev.questions.length + 1}` }]
      }));
      setNewQuestion({ text: '', type: 'scale' });
    }
  };

  const removeQuestion = (index) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const saveSurvey = async () => {
    try {
      await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSurvey)
      });
      setShowCreate(false);
      setNewSurvey({ name: '', description: '', questions: [] });
      fetchSurveys();
    } catch (err) {
      console.error('Failed to save survey');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-600 mt-1">Create and manage survey templates</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create Survey
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto m-4">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Create Survey</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey Name</label>
                <input
                  type="text"
                  value={newSurvey.name}
                  onChange={e => setNewSurvey(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Customer Satisfaction Q1 2026"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSurvey.description}
                  onChange={e => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Brief description of the survey purpose"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Questions ({newSurvey.questions.length})</h3>
                
                <div className="space-y-2 mb-4">
                  {newSurvey.questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">{q.id}</span>
                      <span className="flex-1 text-sm">{q.text}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{q.type}</span>
                      <button onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion.text}
                    onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    className="flex-1 p-2 border rounded-lg text-sm"
                    placeholder="Enter question text..."
                    onKeyPress={e => e.key === 'Enter' && addQuestion()}
                  />
                  <select
                    value={newQuestion.type}
                    onChange={e => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                    className="p-2 border rounded-lg text-sm"
                  >
                    {questionTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                  <button onClick={addQuestion} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button 
                onClick={saveSurvey}
                disabled={!newSurvey.name || newSurvey.questions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading surveys...</div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900">No surveys yet</h3>
            <p className="text-gray-500 mt-1">Create your first survey to get started</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              + Create Survey
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {surveys.map(survey => (
              <div key={survey.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{survey.name}</h3>
                  <p className="text-sm text-gray-500">{survey.questions?.length || 0} questions</p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/simulate?survey=${survey.id}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                  >
                    Run Simulation
                  </Link>
                  <button className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'NPS Survey', questions: 3, icon: '📈' },
            { name: 'Customer Satisfaction', questions: 5, icon: '😊' },
            { name: 'Product Feedback', questions: 8, icon: '💡' },
            { name: 'Brand Awareness', questions: 6, icon: '🎯' },
            { name: 'Market Research', questions: 10, icon: '📊' },
            { name: 'Employee Engagement', questions: 7, icon: '👥' },
          ].map((template, i) => (
            <button
              key={i}
              className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition"
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <div className="font-medium text-gray-900">{template.name}</div>
              <div className="text-sm text-gray-500">{template.questions} questions</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
