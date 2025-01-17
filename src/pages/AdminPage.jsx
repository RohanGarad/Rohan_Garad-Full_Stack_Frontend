import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://rohan-garad-full-stack-backend.onrender.com", {
  withCredentials: true,
}); // Singleton socket instance

const AdminPage = () => {
  const [score, setScore] = useState(null);
  const [matchId, setMatchId] = useState(() => {
    // Retrieve the saved matchId from localStorage, or use the default value
    return localStorage.getItem("matchId") || "12345";
  });
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);

  // Fetch data whenever matchId changes
  useEffect(() => {
  const savedScore = localStorage.getItem("scoreData");
  const lastUpdated = localStorage.getItem("lastUpdated");
  const needsRefresh = !lastUpdated || Date.now() - lastUpdated > 1000; // Refresh if older than 1 seconds

  if (needsRefresh || !savedScore) {
    axios
      .get(`https://rohan-garad-full-stack-backend.onrender.com/api/scores/${matchId}/latest`, {
        params: { _: new Date().getTime() }, // Prevent caching
      })
      .then((res) => {
        setScore(res.data);
        setCurrentOver(res.data.currentOver || 1);
        setCurrentBall(res.data.currentBall || 1);
        localStorage.setItem("scoreData", JSON.stringify(res.data));
        localStorage.setItem("lastUpdated", Date.now().toString());
      })
      .catch((error) => {
        console.error("Error fetching latest score:", error);
      });
  } else {
    const parsedScore = JSON.parse(savedScore);
    setScore(parsedScore);
    setCurrentOver(parsedScore.currentOver || 1);
    setCurrentBall(parsedScore.currentBall || 1);
    }
  }, [matchId]);

  const handleMatchIdChange = async (e) => {
    const newMatchId = e.target.value;
    
    // Reset the local matchId
    setMatchId(newMatchId);
    localStorage.setItem("matchId", newMatchId); // Save new matchId to localStorage
    
    // Reset the local score state and current over/ball
    setScore(null);
    setCurrentOver(1);
    setCurrentBall(1);
    localStorage.removeItem("scoreData"); // Clear cached data
  
    try {
      // Reset the match score on the server (e.g., resetting to initial state)
      await resetMatchScoreOnServer(newMatchId);
      
      // Notify all connected clients (if relevant)
      socket.emit("reset_match", { matchId: newMatchId });
  
      // Optionally, fetch the initial score data after reset, if needed.
      // You can use the existing `useEffect` to re-fetch data after resetting
      // setScore(null); // This will be handled by the `useEffect` hook when `matchId` changes
    } catch (error) {
      console.error("Error resetting match score:", error);
    }
  };
  
  // Function to reset the match score on the server
  const resetMatchScoreOnServer = async (matchId) => {
    try {
      // Call the backend API to reset the match score data in the database
      const response = await axios.post(`https://rohan-garad-full-stack-backend.onrender.com/api/scores/reset/${matchId}`);
      
      if (response.status === 200) {
        console.log("Match score reset successfully.");
      } else {
        console.error("Failed to reset match score.");
      }
    } catch (error) {
      console.error("Error resetting match score on server:", error);
    }
  };
  

  const handleBallAction = (runs, isOut) => {
    const ballData = {
      matchId,
      over: currentOver,
      ball: currentBall,
      score: runs,
      isOut,
    };

    axios
      .post("https://rohan-garad-full-stack-backend.onrender.com/api/scores/ball", ballData)
      .then((res) => {
        setScore(res.data.matchScore);

        // Increment ball and handle over progression
        setCurrentBall((prevBall) => {
          if (prevBall === 6) {
            setCurrentOver((prevOver) => prevOver + 1);
            return 1;
          }
          return prevBall + 1;
        });

        // Notify user page of score updates
        socket.emit("score_updated", res.data.matchScore);
      })
      .catch((error) => {
        console.error("Error in updating score:", error);
      });
      
  };

  

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header Section */}
      <header className="bg-blue-600 text-white text-center py-4 rounded-md shadow-md">
        <h1 className="text-2xl font-bold">
          {score?.scoreA}/{score?.wickets}
        </h1>
        <h2>Over: {score?.currentOver}.{score?.currentBall}</h2>
        <div className="mt-2">
          <label className="font-semibold mr-2">Match ID:</label>
          <input
            type="text"
            value={matchId}
            onChange={handleMatchIdChange} // Now calls the function
            placeholder="Enter Match ID"
            className="border rounded-md px-4 py-2 text-black"
          />
          <button className="m-6 border rounded-lg px-3 py-1 text-white bg-red-500" onClick={(e) => handleMatchIdChange({ target: { value: "newMatchId" } })}>
            Reset Match
          </button>
        </div> 
      </header>

      {/* Current Ball and Control Section */}
      <section className="mt-8 bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current Over</h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              idx < (currentBall - 1 || 0) ? "bg-green-500 text-white" : "bg-gray-300"
            }`}
          >
            {idx < (currentBall - 1 || 0)
              ? score?.overs?.[currentOver - 1]?.[idx] || "0"
              : idx + 1}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Update Current Ball</h2>
      <div className="flex space-x-4">
        {[0, 1, 2, 3, 4, 6].map((run) => (
          <button
            key={run}
            onClick={() => handleBallAction(run, false)}
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 focus:outline-none"
          >
            {run} Runs
          </button>
        ))}
        <button
          onClick={() => handleBallAction(0, true)}
          className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 focus:outline-none"
        >
          Wicket
        </button>
      </div>
    </section>


    {/* Over Listing Section */}
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

export default AdminPage;