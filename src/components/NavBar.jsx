//////////////////////
// NavBar Component
//////////////////////

// Stylesheet

// Component
import Link from 'next/link';
import Button from '@/components/Button'

export default function NavBar(props) {

  // Template
  return (
    <div>
      <ul>
        <li>
          Happy Helpers
        </li>
        <li>
          <Link href="/home">Home</Link>
        </li>
        <li>
          <Link href="/new-task">New</Link>
        </li>
      </ul>
      <ul>
      <li>
          <Link href="/my-help">MyHelp</Link>
        </li>
        <li>
          <h2>Messages</h2>
        </li>
        <li>
          <Link href="/my-profile/:id">Fred</Link>
        </li>
        <li>
          <Button buttonName={"Logout"}/>
        </li>
      </ul>
    </div>
  );
};