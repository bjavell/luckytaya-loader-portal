import { useState, useEffect } from "react";

interface TimerProps {
  duration: number;
  onEndTimer: any;
}

export default function Timer({ duration, onEndTimer }: TimerProps) {
  const [seconds, setSeconds] = useState<number>(duration / 1000); // Initial time (5 minutes = 300 seconds)
  useEffect(() => {
    if (seconds == 0) onEndTimer();
    return () => {};
  }, [seconds]);

  useEffect(() => {
    // Start a timer that updates every second
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval); // Stop the timer when it reaches 0
          if (prevSeconds == 1) return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // Convert seconds into minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="timer text-center">
      <h1 className="text-4xl font-bold text-yellow">
        {minutes}:
        {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
      </h1>
    </div>
  );
}
