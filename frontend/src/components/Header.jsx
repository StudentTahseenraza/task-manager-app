import { Link } from 'react-router-dom';
import '../index.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">Task Manager</Link>
      </div>
    </header>
  );
}

export default Header;