import ClassCard from "./ClassCard";
import type { Classroom } from "../../../../types/classRoomType";

type Props = {
  classrooms: Classroom[];
};


/**
 * ClassGrid
 * Layout component used to display a collection of classroom cards.
 *
 * Responsibilities:
 * - Arrange classrooms in a responsive grid layout
 * - Render a ClassCard for each classroom
 * - Handle dynamic classroom collections of varying sizes
 */
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
