'use client';

import { useState } from 'react';
import { Comment } from '@/types';

interface ResultsTableProps {
  comments: Comment[];
}

const IntentBadge = ({ score }: { score: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const labels = {
    high: 'High Intent',
    medium: 'Medium Intent',
    low: 'Low Intent'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[score]}`}>
      {labels[score]}
    </span>
  );
};

export default function ResultsTable({ comments }: ResultsTableProps) {
  const [contactedItems, setContactedItems] = useState<Set<string>>(new Set());

  const handleContactedChange = (index: number, checked: boolean) => {
    const newContacted = new Set(contactedItems);
    const key = `${comments[index].videoUrl}-${index}`;
    
    if (checked) {
      newContacted.add(key);
    } else {
      newContacted.delete(key);
    }
    
    setContactedItems(newContacted);
  };

  const exportToCSV = () => {
    const headers = ['Video URL', 'Comment', 'Username', 'Profile URL', 'Intent Score', 'Keywords', 'Contacted'];
    const csvContent = [
      headers.join(','),
      ...comments.map((comment, index) => {
        const key = `${comment.videoUrl}-${index}`;
        const contacted = contactedItems.has(key) ? 'Yes' : 'No';
        return [
          `"${comment.videoUrl}"`,
          `"${comment.commentText.replace(/"/g, '""')}"`,
          `"${comment.username || 'Unknown'}"`,
          `"${comment.profileUrl || ''}"`,
          comment.intentScore,
          `"${comment.matchedKeywords.join(', ')}"`,
          contacted
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reno-radar-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden">
      {/* Export Button */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {comments.filter((_, index) => contactedItems.has(`${comments[index].videoUrl}-${index}`)).length} of {comments.length} contacted
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video & Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keywords
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map((comment, index) => {
              const key = `${comment.videoUrl}-${index}`;
              const isContacted = contactedItems.has(key);
              
              return (
                <tr key={key} className={isContacted ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <a
                        href={comment.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium truncate block max-w-xs"
                        title={comment.videoUrl}
                      >
                        🎥 View TikTok Video
                      </a>
                      <p className="text-gray-900 text-sm max-w-md">
                        "{comment.commentText}"
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {comment.profileUrl ? (
                        <a
                          href={comment.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                          title={`View TikTok Profile: ${comment.profileUrl}`}
                        >
                          {comment.username || 'TikTok User'}
                        </a>
                      ) : (
                        comment.username || 'Unknown'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <IntentBadge score={comment.intentScore} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {comment.matchedKeywords.map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isContacted}
                          onChange={(e) => handleContactedChange(index, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {isContacted ? 'Contacted' : 'Mark as contacted'}
                        </span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 