import ClassCard from "./ClassCard";
import type { Classroom } from "../data/classRoomType";

type Props = {
  classrooms: Classroom[];
};

const ClassGrid = ({ classrooms }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classrooms.map((classroom) => (
        <ClassCard key={classroom.id} classroom={classroom} />
      ))}
    </div>
  );
};

export default ClassGrid;
