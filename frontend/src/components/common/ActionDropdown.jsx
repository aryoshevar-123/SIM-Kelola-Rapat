import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMoreVertical } from 'react-icons/fi';

export default function ActionDropdown({ id, isOpen, onToggle, actions, rowData }) {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updateCoordinates = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      if (rect.top < 50 || rect.bottom > window.innerHeight) {
        onToggle('');
        return;
      }

      setCoords({
        top: rect.bottom,      
        left: rect.right - 160 
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        if (isOpen) onToggle('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen) {
      updateCoordinates(); 

      window.addEventListener('scroll', updateCoordinates, true);
      window.addEventListener('resize', updateCoordinates);
    }

    return () => {
      window.removeEventListener('scroll', updateCoordinates, true);
      window.removeEventListener('resize', updateCoordinates);
    };
  }, [isOpen]);

  return (
    <div className="inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(isOpen ? '' : id);
        }}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
        }`}
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed', 
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className="w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] py-1.5 min-w-[150px] animate-fadeIn"
        >
          {actions.map((action, index) => {
            if (action.divider) {
              return <div key={`div-${index}`} className="my-1 border-t border-slate-100" />;
            }

            const Icon = action.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle('');
                  action.onClick(rowData);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                  action.variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}