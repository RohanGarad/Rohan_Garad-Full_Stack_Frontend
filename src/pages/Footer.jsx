{/* Footer Section */}
const Footer = () => {
return (
    <footer className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-6 rounded-lg shadow-lg">
      <p className="text-lg font-semibold tracking-wide">
        Cricket Scoreboard - Powered by Passion
      </p>
      <p className="text-sm mt-2">Made by <span className="text-yellow-400 font-bold">Rohan Garad</span></p>

      <div className="mt-1 flex justify-center gap-4">
        <a
        href="https://www.linkedin.com/in/rohangarad/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-yellow-400 transition-all duration-200 ease-in-out"
        >
        <i className="fab fa-linkedin"></i> LinkedIn
        </a>
        <a
        href="https://github.com/RohanGarad"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-yellow-400 transition-all duration-200 ease-in-out"
        >
        <i className="fab fa-github"></i> GitHub
        </a>
        <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl hover:text-yellow-400 transition-all duration-200 ease-in-out"
        >
        <i className="fab fa-twitter"></i> Twitter
        </a>
    </div>
    </footer>
);
}
export default Footer;