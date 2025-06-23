import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { activities } from "../constants";

const Activities = () => {
  return (
    <>
      <div className="flex flex-row flex-wrap justify-center gap-10">
        {activities.map((activity) => (
          <div className="w-28 h-28" key={activity.name}>
            <BallCanvas icon={activity.icon} />
          </div>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Activities, "activity");
