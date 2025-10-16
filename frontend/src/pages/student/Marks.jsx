import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Marks() {
  const { studentId } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, [studentId]);

  const fetchMarks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/marks/${studentId}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalMarksPercentage = () => {
    if (!analytics?.marksBySubject) return 0;
    
    let totalScore = 0;
    let totalSubjects = 0;
    
    Object.values(analytics.marksBySubject).forEach(subjectMarks => {
      if (subjectMarks.length > 0) {
        const latestScore = subjectMarks[0].score;
        totalScore += latestScore;
        totalSubjects++;
      }
    });
    
    return totalSubjects > 0 ? Math.round((totalScore / totalSubjects) * 100) / 100 : 0;
  };

  const prepareChartData = () => {
    if (!analytics?.marksBySubject) return [];
    
    return Object.entries(analytics.marksBySubject).map(([subject, marks]) => ({
      subject,
      score: marks[0]?.score || 0 // Get the latest score for each subject
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Academic Performance</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Overall Performance</p>
          <p className={`text-2xl font-bold ${
            calculateTotalMarksPercentage() >= 80 ? 'text-green-600' :
            calculateTotalMarksPercentage() >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {calculateTotalMarksPercentage()}%
          </p>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Marks Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.marksBySubject ? Object.entries(analytics.marksBySubject).map(([subject, marks]) => {
                const latestMark = marks[0];
                const getGrade = (score) => {
                  if (score >= 90) return 'A+';
                  if (score >= 80) return 'A';
                  if (score >= 70) return 'B+';
                  if (score >= 60) return 'B';
                  if (score >= 50) return 'C';
                  return 'F';
                };
                
                return (
                  <tr key={subject}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {latestMark?.score || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {latestMark?.examDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        latestMark?.score >= 80 ? 'bg-green-100 text-green-800' :
                        latestMark?.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {latestMark?.score ? getGrade(latestMark.score) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No marks available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Performance Chart</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
