import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const UserPage = () => {
  // Retrieve matchId from localStorage if available; else use the default
  const savedMatchId = localStorage.getItem("matchId") || "12345";
  const [matchId, setMatchId] = useState(savedMatchId); // Default matchId or saved one
  const [score, setScore] = useState(null);
  const [currentBallOutcome, setCurrentBallOutcome] = useState(null);

  useEffect(() => {
    // Save matchId to localStorage whenever it changes
    localStorage.setItem("matchId", matchId);

    // Initialize socket connection
    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // Fetch initial score for the selected matchId
    if (matchId) {
      axios
        .get(`http://localhost:5000/api/scores/${matchId}/latest`)
        .then((res) => {
          console.log("Initial score data:", res.data); // Log to check the response
          setScore(res.data);
        })
        .catch((error) => {
          console.error("Error fetching initial score:", error);
        });
    }

    // Listen for real-time score updates
    socket.on("score_updated", (updatedScore) => {
      console.log("Received updated score:", updatedScore); // Log received update
      if (updatedScore.matchId === matchId) {
        setScore(updatedScore);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [matchId]);

  // Calculate currentBallOutcome dynamically based on the latest ball
  useEffect(() => {
    if (score?.overs?.length > 0) {
      const currentOver = score.overs[score.currentOver - 1] || []; // Get current over
      const ballOutcome = currentOver[score.currentBall - 1]; // Get current ball outcome

      if (!isNaN(ballOutcome) && ballOutcome > 0) {
        setCurrentBallOutcome("run"); // It's a run
      } else if (ballOutcome === "Out" || ballOutcome === "W") {
        setCurrentBallOutcome("wicket"); // It's a wicket
      } else {
        setCurrentBallOutcome(null); // No action
      }
    }
  }, [score]);

  // Handle matchId input changes
  const handleMatchIdChange = (e) => {
    setMatchId(e.target.value); // Update matchId state
  };

  if (!score) {
    return <div>Loading data for match ID: {matchId}...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="bg-blue-600 text-white text-center py-4 rounded-md shadow-md">
        <h1 className="text-2xl font-bold">
          {score.scoreA}/{score.wickets}
        </h1>
        <h2>
          Over: {score.currentOver}.{score.currentBall}
        </h2>
        {/* Match Selection */}
        <div className="my-4 flex justify-center">
          <h1 className="items-center justify-center font-bold mt-2 m-2">Match ID:</h1>

          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Enter Match ID"
            className="border rounded-md px-4 py-2 text-black"
          />
        </div>
      </header>


      {/* Animation */}
      <div className="flex justify-center items-center mt-8 flex-wrap">
        {/* Run Animation */}
        {currentBallOutcome === "run" && (
          <div
            className="flex justify-center items-center bg-green-100 rounded-lg p-6 shadow-lg w-96 sm:w-72 md:w-96 relative overflow-hidden"
            key={`run-${Date.now()}`}
            onAnimationEnd={() => setCurrentBallOutcome(null)}
          >
            <video
              src="/video/giphy.mp4"
              className="h-16 rounded-full mr-3"
              autoPlay
              muted
              onEnded={() => setCurrentBallOutcome(null)}
            ></video>
            <div className="absolute inset-0 bg-green-300 opacity-50 rounded-full animate-ping"></div>
  
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">+RUN</span>
              </div>
            </div>
  
            <div className="absolute top-0 left-0 animate-sparkle">
              <div className="w-4 h-4 bg-yellow-300 rounded-full opacity-80 transform rotate-45"></div>
            </div>
            <div className="absolute top-1/3 right-0 animate-sparkle-delay">
              <div className="w-4 h-4 bg-yellow-300 rounded-full opacity-80 transform rotate-45"></div>
            </div>
            <div className="absolute bottom-0 left-1/3 animate-sparkle-delay-2">
              <div className="w-4 h-4 bg-yellow-300 rounded-full opacity-80 transform rotate-45"></div>
            </div>
  
            <p className="text-green-600 font-bold text-2xl animate-pulse sm:text-xl">
              Runs Added!
            </p>
          </div>
        )}
  
        {/* Wicket Animation */}
        {currentBallOutcome === "wicket" && (
          <div
            className="flex justify-center items-center bg-red-100 rounded-lg p-6 shadow-lg w-96 sm:w-72 md:w-96 relative overflow-hidden"
            key={`wicket-${Date.now()}`}
            onAnimationEnd={() => setCurrentBallOutcome(null)}
          >
            <video
              src="/video/Cricket Wicket.mp4"
              className="h-16 rounded-full mr-3"
              autoPlay
              muted
              onEnded={() => setCurrentBallOutcome(null)}
            ></video>
  
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-shake">
              <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">OUT!</span>
              </div>
            </div>
  
            <p className="text-red-600 font-bold text-2xl animate-blink sm:text-xl">
              Wicket Taken!
            </p>
          </div>
        )}
      </div>

      {/* Completed Overs Section */}
      <section className="mt-8 bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Completed Overs</h2>
        <ul className="space-y-2">
          {score?.overs && score.overs.length > 0 ? (
            score.overs.map((over, index) => (
              <li
                key={index}
                className="bg-gray-100 px-4 py-2 rounded-md shadow-md"
              >
                <strong>Over {index + 1}:</strong>{" "}
                {over?.map((ball, idx) => (
                  <span
                    key={idx}
                    className="inline-block w-6 h-6 text-center bg-blue-500 text-white rounded-full mx-1"
                  >
                    {ball}
                  </span>
                ))}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No overs completed yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default UserPage;
