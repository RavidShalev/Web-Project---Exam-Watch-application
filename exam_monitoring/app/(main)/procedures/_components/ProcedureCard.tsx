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
  "phone-off": Smartphone,
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
  icon: string;
};

export default function ProcedureCard({ 
  title, 
  content, 
  sectionId, 
  icon 
}: ProcedureCardProps) {
  const IconComponent = iconMap[icon] || iconMap["default"];

  return (
    <div
      className="
        bg-[var(--surface)]
        border border-[var(--border)]
        rounded-2xl
        p-6
        shadow-sm
        hover:shadow-md
        transition
        flex flex-col gap-3 h-full
      "
    >
      
      {/* Top part: Icon and Section ID */}
      <div className="flex justify-between items-start">
        <div
          className="
            p-3 rounded-lg
            bg-[var(--accent)/10]
            text-[var(--accent)]
          "
        >
          <IconComponent size={24} />
        </div>

        <span
          className="
            text-xs font-mono
            text-[var(--muted)]
            bg-[var(--border)]
            px-2 py-1 rounded-md
          "
        >
          § {sectionId}
        </span>
      </div>

      {/* Middle part: Title */}
      <h3 className="text-xl font-bold text-[var(--fg)] mt-2">
        {title}
      </h3>

      {/* Bottom part: The content text */}
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        {content}
      </p>
    </div>
  );
}
