import { useState } from 'react';
import './MeteorBackground.css';

/* Random positions baked once via a lazy useState initialiser so
   re-renders never reshuffle the meteors. (React purity rules forbid
   Math.random in render bodies.) */
const generateMeteors = (number) =>
    Array.from({ length: number }, (_, idx) => ({
        id: idx,
        // Bias towards left side for better coverage of the scroll snap container
        top: Math.floor(Math.random() * 80),
        left: Math.floor(Math.random() * 70),
        // Varied animation delays (0s to 4s)
        animationDelay: (Math.random() * 4).toFixed(2),
        // Animation duration between 4s and 8s (slower = less CPU)
        animationDuration: Math.floor(Math.random() * 4 + 4),
    }));

const MeteorBackground = ({ number = 12 }) => {
    const [meteors] = useState(() => generateMeteors(number));

    return (
        <div className="meteor-container">
            {meteors.map((meteor) => (
                <span
                    key={meteor.id}
                    className="meteor"
                    style={{
                        top: `${meteor.top}%`,
                        left: `${meteor.left}%`,
                        animationDelay: `${meteor.animationDelay}s`,
                        animationDuration: `${meteor.animationDuration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default MeteorBackground;
