"use client";

import { 
  Smartphone, 
  IdCard, 
  AlertTriangle, 
  Info, 
  Clock, 
  DoorOpen, 
  FileText 
} from 'lucide-react';

// 1. Map the string from DB to a real Icon Component
const iconMap: any = {
  "phone": Smartphone,
  "phone-off": Smartphone, // will show phone icon
  "id-card": IdCard,
  "alert": AlertTriangle,
  "info": Info,
  "clock": Clock,
  "door-open": DoorOpen,
  "file-import": FileText,
  "default": Info
};

type ProcedureCardProps = {
  title: string;
  content: string;
  sectionId: string;
  icon: string; // comes from DB as string
};

export default function ProcedureCard({ 
  title, 
  content, 
  sectionId, 
  icon 
}: ProcedureCardProps) {
  const IconComponent = iconMap[icon] || iconMap["default"];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-all hover:shadow-md h-full">
      
      {/* Top part: Icon and Section ID */}
      <div className="flex justify-between items-start">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <IconComponent size={24} />
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
          § {sectionId}
        </span>
      </div>

      {/* Middle part: Title */}
      <h3 className="text-xl font-bold text-gray-900 mt-2">
        {title}
      </h3>

      {/* Bottom part: The content text */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {content}
      </p>
    </div>
  );
}