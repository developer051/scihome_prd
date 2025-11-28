'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Section {
  _id: string;
  name: string;
  description: string;
  order: number;
  endDate?: string;
  createdAt: string;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleDelete = async (section: Section) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบ Section นี้?')) {
      try {
        const response = await fetch(`/api/sections/${section._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchSections();
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'เกิดข้อผิดพลาดในการลบ Section');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ Section');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingSection ? `/api/sections/${editingSection._id}` : '/api/sections';
      const method = editingSection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingSection(null);
        fetchSections();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSection(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการ Section</h1>
          <button
            onClick={() => {
              setEditingSection(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> เพิ่ม Section
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">กำลังโหลด...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลำดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คำอธิบาย
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันสิ้นสุด
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {section.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {section.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.endDate ? new Date(section.endDate).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(section)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <SectionForm
            section={editingSection}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function SectionForm({ section, onSubmit, onClose }: {
  section: Section | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: section?.name || '',
    description: section?.description || '',
    order: section?.order || 0,
    endDate: section?.endDate ? new Date(section.endDate).toISOString().split('T')[0] : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {section ? 'แก้ไข Section' : 'เพิ่ม Section ใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ Section *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ลำดับ *
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันสิ้นสุด
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {section ? 'บันทึกการแก้ไข' : 'เพิ่ม Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





