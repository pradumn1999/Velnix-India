import React from 'react';
import { ShippingAddress } from '../../types';
import { MapPin, Phone, Check, Edit2, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: ShippingAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (address: ShippingAddress) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  className = '',
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all text-sm relative flex flex-col justify-between ${
        isSelected
          ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${onSelect ? 'cursor-pointer' : ''} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">{address.fullName}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
              {address.type}
            </span>
            {address.isDefault && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Default
              </span>
            )}
          </div>

          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed mb-2">
          {address.addressLine}
          {address.landmark && `, near ${address.landmark}`}, {address.city},{' '}
          {address.state} – <span className="font-semibold text-neutral-800">{address.pincode}</span>
        </p>

        <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-3">
          <Phone className="w-3.5 h-3.5 text-neutral-500" />
          <span>{address.mobile}</span>
        </div>
      </div>

      {showActions && (
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address.id);
              }}
              className="text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
            >
              Set as Default
            </button>
          )}
          {address.isDefault && <span />}

          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address.id);
                }}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
