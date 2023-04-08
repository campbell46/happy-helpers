//////////////////////
// Profile Page
//////////////////////

import Head from "next/head";
import { useEffect, useState } from 'react';
import axios from "axios";

// Component dependencies
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import TaskList from "@/components/TaskList";

export default function ProfilePage({ user, userAddress }) {
  const [userData, setUserData] = useState(user.user);
  // console.log(user);
  // console.log(`${userAddress.address.address} ${userAddress.address.city} ${userAddress.address.postcode}`);
  const fullAdd = `${userAddress.address.address} ${userAddress.address.city} ${userAddress.address.postcode}`;
  const [fullAddress, setFullAddress] = useState(fullAdd);
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);

  // Helper functions
  const toggleEditProfileForm = () => {
    setShowEditProfileForm(!showEditProfileForm);
  };


  // Template
  return (
    <>
      <Head>
        <title>Happy Helpers</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-neutral-100">
        <NavBar />
        <div className="flex">
          <section className="w-[1500px] h-screen sticky top-0">
            <h1>{`${userData.firstName} ${userData.lastName}`}</h1><br></br>
            <Button buttonName='Edit Profile' onClick={toggleEditProfileForm} />
            {showEditProfileForm && (
              <form>
                <input />
              </form>
            )}
            <br></br>
            <h1>Address:</h1>
            <p>{fullAddress}</p><br></br>
            <h1>Phone Number:</h1>
            <p>{userData.phone}</p><br></br>
            <h1>Skills:</h1>
            <p>Tech support<br></br>
              Lawn Mowing<br></br>
              Cooking<br></br>
              Carpentry</p><br></br>
            <h1>Organizations:</h1>
            <p>Meals on Wheels</p><br></br>
            <h1>Description:</h1>
            <p>{userData.description}</p><br></br>
          </section>
          <section>
            <h1>Your Upcoming tasks</h1>
            {/* <TaskList tasks={fetchTasks} /> */}
            {/* <h1>Past Tasks</h1> */}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Data fetching

// User table profile data
export async function getServerSideProps() {
  const user = await axios.get(`http://localhost:3000/api/users/${1}`);
  // console.log('userAddressId', user.data.user.addressId)
  // console.log('USER:', user.data.user.addressId)
  const userAddress = await axios.get(`http://localhost:3000/api/addresses/${user.data.user.addressId}`);
  // console.log(userAddress)
  return {
    props: { user: user.data, userAddress: userAddress.data }
  };
}