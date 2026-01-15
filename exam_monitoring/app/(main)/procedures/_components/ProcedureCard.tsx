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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 transition-all hover:shadow-md h-full">
      
      {/* Top part: Icon and Section ID */}
      <div className="flex justify-between items-start">
        <div className="p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl">
          <IconComponent size={24} />
        </div>
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
          § {sectionId}
        </span>
      </div>

      {/* Middle part: Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
        {title}
      </h3>

      {/* Bottom part: The content text */}
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {content}
      </p>
    </div>
  );
}