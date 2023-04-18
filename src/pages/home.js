///////////////
// Home Page
///////////////

// Vendor methods
import Head from 'next/head';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Inter } from 'next/font/google';
import prisma from '../../prisma/.db';

// Helper functions
import addCoordsToTasks from '../helpers/add-coords-to-tasks';
import addCoordsToUser from '../helpers/add-coords-to-user'
import addDistanceToTasks from '../helpers/add-distance-to-tasks';
import sortTasksByDistance from '../helpers/sort-tasks-by-distance';
import sortTasksByStartTime from '../helpers/sort-tasks-by-start-time';


// Component dependencies
import TaskList from '@/components/TaskList';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import Map from '@/components/Map';

// Global variables
const inter = Inter({ subsets: ['latin'] });
const sidebarOptions = [
  'All Categories',
  'Animal Care',
  'Charity & Causes',
  'Cooking',
  'DIY',
  'Driving',
  'Errands',
  'Giving',
  'Heavy Lifting',
  'Housework',
  'Personal Care',
  'Social',
  'Tech Support',
  'Yard Work',
  'Other'
];

const distances = [
  1, 5, 10, 25, 50, 'all'
];

/////////////////////
// Page (component)
export default function Home({ tasks, user }) {

  // Hooks
  const [fetchTasks, setFetchTasks] = useState([...tasks]);
  const [sidebar, setSidebar] = useState(sidebarOptions);
  const [view, setView] = useState("List");
  const [filteredTasks, setFilteredTasks] = useState([...tasks]);

  const tasksToFilter = [...fetchTasks];
  const [taskFilters, setTaskFilters] = useState({
    distance: 50,
    category: 'All Categories',
    sort: 'Date',
    dateFilter: null,
    city: ''
  });

  const [category, setCategory] = useState(taskFilters.category);

  // Sort and Filter Tasks
  const filterTasks = function (tasks, filters) {
    // Function globals
    const unfilteredTasks = [...tasks];
    let tasksInCategory;
    let sortedFilteredTasks;
    let tasksCloserThan;
    let tasksInCity;
    let filteredByDate;
    let distance;

    // Filters
    // Set distance filter
    if (filters.distance === 'all') {
      distance = Infinity;
    } else {
      distance = parseInt(filters.distance);
    }

    // Filter by distance
    tasksCloserThan = [...unfilteredTasks].filter(task => task.distance <= distance);

    // Search and filter by city
    if (filters.city === '') {
      tasksInCity = tasksCloserThan;
    } else {
      tasksInCity = tasksCloserThan.filter(task => task.address.city.toLowerCase().includes(filters.city));
      console.log(tasksInCity)
    }

    // Filter by category
    if (filters.category === 'All Categories') {
      tasksInCategory = tasksInCity;
    } else {
      tasksInCategory = tasksInCity.filter(task => task.category === filters.category);
    }

    // Filter by date
    if (!filters.date) {
      filteredByDate = tasksInCategory;
    } else {
      filteredByDate = tasksInCategory.filter(task => new Date(task.startDate).toISOString().substring(0, 10) === filters.date)
    }
    console.log(filteredByDate)
    // Sort by distance or date
    if (filters.sort === 'Distance') {
      sortedFilteredTasks = sortTasksByDistance(filteredByDate)
    } else {
      sortedFilteredTasks = sortTasksByStartTime(filteredByDate)
    }

    // Update state -> fire render of filtered tasks
    setFilteredTasks(sortedFilteredTasks)
  }

  const currentView = (view === "List" ? <TaskList tasks={filteredTasks} /> : <Map tasks={filteredTasks} />)

  // Template
  return (
    <>
      <Head>
        <title>Happy Helpers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NavBar name={user.firstName}
          id={user.id} />
        <div className="flex pl-2">
          <Sidebar
            sidebarOptions={sidebar}
            filterTasks={() => filterTasks(tasksToFilter, taskFilters)}
            filters={taskFilters}
            setFilters={setTaskFilters}
            setCategory={setCategory}
            distances={distances}
          />
          <section className='flex flex-col p-2 mx-4 grow'>
            <PageHeader setView={setView} city={user.address.city} category={category} />
            {currentView}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Data fetching
export async function getServerSideProps() {

  // Capture tasks with addresses:
  const tasks = await prisma.task.findMany({
    where: {
      status: "OPEN"
    },
    include: {
      address: true
    },
    orderBy: {
      startDate: 'desc'
    }
  })

  // Define current user
  const userFetch = await prisma.user.findMany({
    where: {
      id: 1
    },
    include: {
      address: true
    }
  })

  const user = userFetch[0];
  console.log(user)

  // Add distance between user and task to tasks, order by ascending start time
  addDistanceToTasks(tasks, user);
  const sortedTasks = sortTasksByStartTime(tasks);
  return {
    props: {
      tasks: JSON.parse(JSON.stringify(sortedTasks)),
      user: JSON.parse(JSON.stringify(user))
    }
  };
}
