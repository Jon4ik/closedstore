import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Phone, Mail, UserCheck, UserX } from 'lucide-react';

export default function TUsModal() {
  const { tus, addTU, updateTU, currentUser, hasPermission } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('Технический управляющий');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!hasPermission('manage_tus')) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTU({ fullName: newName.trim(), position: newPosition.trim(), phone: newPhone.trim(), email: newEmail.trim(), isActive: true });
    setNewName(''); setNewPhone(''); setNewEmail('');
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
        <UserCheck size={18} /> Справочник ТУ
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Справочник ТУ</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Добавить ТУ</p>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ФИО" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="Должность" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Телефон" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Добавить</button>
              </div>
              <div className="space-y-1">
                {tus.map(tu => (
                  <div key={tu.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${tu.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{tu.fullName}</p>
                      <p className="text-xs text-gray-500">{tu.position}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {tu.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} />{tu.phone}</span>}
                        {tu.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} />{tu.email}</span>}
                      </div>
                    </div>
                    <button onClick={() => updateTU(tu.id, { isActive: !tu.isActive })} className={`p-1.5 rounded-lg ${tu.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={tu.isActive ? 'Активен' : 'Неактивен'}>
                      {tu.isActive ? <UserCheck size={16} /> : <UserX size={16} />}
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
