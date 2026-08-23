import React from 'react';
import { NotificationUpdate } from '../types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates: NotificationUpdate[];
  onMarkAllRead: () => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  updates,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fbf9f5] w-full max-w-[520px] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#efeeea] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#895100]">notifications</span>
            <h2 className="font-quicksand font-bold text-xl text-[#895100]">
              Notifications &amp; Alerts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-[#efeeea]">
            <span className="text-xs font-semibold text-[#877462]">Recent Activity</span>
            <button
              onClick={onMarkAllRead}
              className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  update.read
                    ? 'bg-white border-[#efeeea]'
                    : 'bg-[#ffdcbc]/20 border-[#ff9f1c]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    update.type === 'booking'
                      ? 'bg-[#dce1ff] text-[#314685]'
                      : update.type === 'reminder'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#c2edca] text-[#294e35]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg filled-icon">
                    {update.type === 'booking'
                      ? 'event_available'
                      : update.type === 'reminder'
                      ? 'alarm'
                      : 'pets'}
                  </span>
                </div>

                <div className="flex-grow">
                  <p className="text-xs font-semibold text-[#1b1c1a] leading-relaxed">
                    {update.text}
                  </p>
                  <span className="text-[11px] text-[#877462] mt-1 block">
                    {update.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#efeeea] border-t border-[#dac2ae]/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-full bg-white border border-[#dac2ae] text-[#544434] text-xs font-bold hover:bg-[#fbf9f5] cursor-pointer"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
