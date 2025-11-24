import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { LeadForm } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadGenModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<LeadForm>({ name: '', phone: '', targetExam: '国考' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the CRM
    console.log("Lead Generated:", form);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-fade-in-up">
        
        {!submitted ? (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
              <h2 className="text-xl font-bold mb-1">解锁全套真题解析</h2>
              <p className="text-red-100 text-sm">优路公考·名师1对1备考规划</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">您的称呼</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="例如：张同学"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input 
                  type="tel" 
                  required
                  pattern="[0-9]{11}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="接收资料的手机号"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备考目标</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={form.targetExam}
                  onChange={e => setForm({...form, targetExam: e.target.value})}
                >
                  <option>国考</option>
                  <option>省考</option>
                  <option>事业单位</option>
                  <option>教师招聘</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transform transition active:scale-95"
              >
                立即免费领取
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-2">
                已有 12,403 位同学领取了今日资料
              </p>
            </form>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">提交成功！</h3>
            <p className="text-gray-600 text-sm">
              我们的专业老师将在24小时内联系您，并发送备考资料包。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};