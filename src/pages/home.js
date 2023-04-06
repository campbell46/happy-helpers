import { useState, useEffect } from 'react';
import Head from 'next/head';
import TaskList from '@/components/TaskList';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { PrismaClient } from '@prisma/client';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';

const inter = Inter({ subsets: ['latin'] });



export default function Home(props) {
  const [tasks, setTasks] = useState(props.tasks);
  // const [category, setCategory] = useState(0);

  useEffect(() => {

    const getTasks = async () => {
    const prisma = new PrismaClient();
    const filteredTasks = await prisma.task.findMany();
    console.log(filteredTasks)
    setTasks(filteredTasks);
    
  }
  getTasks();
   
  }, [])
  return (
    <>
      <Head>
        <title>Happy Helpers</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-white">
        <NavBar />
        <div className="flex">
        <Sidebar />
        <section className='flex flex-col'>
          <PageHeader />
          <TaskList tasks={tasks} />
        </section>
        
        </div>
      </main>

      <Footer />
    </>
  )
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();
  const tasks = await prisma.task.findMany();
  
  return {
    props: { tasks }
  }
}
// async function getTasks() {
//   const prisma = new PrismaClient();
//   // const filteredTasks = await prisma.task.findMany();
//   // setTasks(filteredTasks)
  
//   return {
//     props: { tasks }
//   }
// }