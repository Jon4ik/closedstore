import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, UserCheck, UserX, Users } from 'lucide-react';

export default function EmployeesModal() {
  const { employees, addEmployee, updateEmployee, currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addEmployee({ fullName: newName.trim(), position: newPosition.trim() || 'Сотрудник', isActive: true });
    setNewName('');
    setNewPosition('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Users size={18} />
        Сотрудники
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Справочник сотрудников</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Add new */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="ФИО"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newPosition}
                  onChange={e => setNewPosition(e.target.value)}
                  placeholder="Должность"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Добавить
                </button>
              </div>

              {/* List */}
              <div className="space-y-1">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className={`text-sm font-medium ${emp.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {emp.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                    <button
                      onClick={() => updateEmployee(emp.id, { isActive: !emp.isActive })}
                      className={`p-1.5 rounded-lg ${emp.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={emp.isActive ? 'Активен' : 'Неактивен'}
                    >
                      {emp.isActive ? <UserCheck size={16} /> : <UserX size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
