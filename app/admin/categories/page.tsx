'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Section {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  sectionId: string | Section;
  order: number;
  endDate?: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, sectionsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/sections'),
      ]);
      const [categoriesData, sectionsData] = await Promise.all([
        categoriesRes.json(),
        sectionsRes.json(),
      ]);
      setCategories(categoriesData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบ Category นี้?')) {
      try {
        const response = await fetch(`/api/categories/${category._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchData();
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'เกิดข้อผิดพลาดในการลบ Category');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ Category');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingCategory(null);
        fetchData();
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
    setEditingCategory(null);
  };

  const getSectionName = (sectionId: string | Section): string => {
    if (typeof sectionId === 'string') {
      const section = sections.find(s => s._id === sectionId);
      return section?.name || sectionId;
    }
    return sectionId.name;
  };

  // Group categories by section
  const categoriesBySection = categories.reduce((acc, category) => {
    const sectionId = typeof category.sectionId === 'string' ? category.sectionId : category.sectionId._id;
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการ Category</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> เพิ่ม Category
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">กำลังโหลด...</div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionCategories = categoriesBySection[section._id] || [];
              if (sectionCategories.length === 0) return null;
              
              return (
                <div key={section._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">{section.name}</h2>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ลำดับ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อ Category
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
                      {sectionCategories.map((category) => (
                        <tr key={category._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {category.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.endDate ? new Date(category.endDate).toLocaleDateString('th-TH') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
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
              );
            })}
          </div>
        )}

        {showForm && (
          <CategoryForm
            category={editingCategory}
            sections={sections}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function CategoryForm({ category, sections, onSubmit, onClose }: {
  category: Category | null;
  sections: Section[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    sectionId: category ? (typeof category.sectionId === 'string' ? category.sectionId : category.sectionId._id) : '',
    order: category?.order || 0,
    endDate: category?.endDate ? new Date(category.endDate).toISOString().split('T')[0] : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          {category ? 'แก้ไข Category' : 'เพิ่ม Category ใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">เลือก Section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ Category *
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
              {category ? 'บันทึกการแก้ไข' : 'เพิ่ม Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




