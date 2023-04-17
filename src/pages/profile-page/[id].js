//////////////////////
// Profile Page
//////////////////////

import Head from "next/head";
import { useEffect, useState } from 'react';
import axios from "axios";
import prisma from "../../../prisma/.db";
import { useRouter } from "next/navigation";

// Component dependencies
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import TaskList from "@/components/TaskList";
import EditProfileForm from "@/components/EditProfileForm";

// Helper function dependencies
import addCoordsToTasks from "@/helpers/add-coords-to-tasks";
import addCoordsToUser from "@/helpers/add-coords-to-user";
import addDistanceToTasks from "@/helpers/add-distance-to-tasks";

export default function ProfilePage({ user, userAddress, userOrganizations, upcomingData, pastData }) {
  // HOOKS
  const [userData, setUserData] = useState(user.user);
  console.log(userData);
  // console.log(`${userAddress.address.address} ${userAddress.address.city} ${userAddress.address.postcode}`);
  const fullAdd = `${userAddress.address.address} ${userAddress.address.city} ${userAddress.address.postcode}`;
  const [fullAddress, setFullAddress] = useState(fullAdd);

  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [editProfileFormData, setEditProfileFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    skills: "",
    // organizations: "",
  });

  // console.log(upcomingData)
  // console.log(pastData)
  const [upcomingTasksData, setUpcomingTasksData] = useState(upcomingData);
  const [pastTasksData, setPastTasksData] = useState(pastData);

  // HELPER FUNCTIONS
  const toggleEditProfileForm = () => {
    setShowEditProfileForm(!showEditProfileForm);
  };

  let [orgString, setOrgString] = useState("");

  useEffect(() => {
    let orgStr = "";
    userOrganizations.forEach((org, index) => {
      if (userOrganizations.length - 1 === index) {
        orgStr += `${org.name}.`;
      } else {
        orgStr += `${org.name}, `;
      }
    });
    setOrgString(orgStr);
  }, [userOrganizations]);

  // TEMPLATE
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
          <section style={{ margin: "0rem 1.5rem", padding: "1rem 1.5rem", backgroundColor: "rgb(13 148 136)", color: "white", width: "20%" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}>Profile Details</h1>
            <br></br>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={userData.avatar}
                className="rounded-full"
                alt="Avatar"
              />
            </div>
            <br></br>
            <h1 style={{ fontWeight: "bold" }}>Name:</h1>
            <p>{`${userData.firstName} ${userData.lastName}`}</p>
            <br></br>
            <h1 style={{ fontWeight: "bold" }}>Stars:</h1>
            <p>{userData.stars}</p>
            {user.user.id === 1 && <>
              <br></br>
              <button className='inline-flex justify-center items-center gap-2 bg-purple-600 px-4 py-1 rounded text-white' type='button' name='Edit Profile' onClick={toggleEditProfileForm}>Edit Profile</button>
              <br></br>
            </>}
            {showEditProfileForm &&
              <EditProfileForm
                userId={userData.id}
                userAddressId={userData.addressId}
                editProfileFormData={editProfileFormData}
                setEditProfileFormData={setEditProfileFormData}
              />
            }
            <br></br>
            <h1 style={{ fontWeight: "bold" }}>Address:</h1>
            <p>{fullAddress}</p><br></br>
            <h1 style={{ fontWeight: "bold" }}>Email:</h1>
            <p>{userData.email}</p><br></br>
            <h1 style={{ fontWeight: "bold" }}>Phone Number:</h1>
            <p>{userData.phone}</p><br></br>
            <h1 style={{ fontWeight: "bold" }}>Skills:</h1>
            <p>{userData.skills}</p><br></br>
            <h1 style={{ fontWeight: "bold" }}>Organizations:</h1>
            <p>{orgString}</p><br></br>
            <h1 style={{ fontWeight: "bold" }}>Description:</h1>
            <p>{userData.description}</p><br></br>
          </section>
          <section>
            <h1 style={{ color: "rgb(13 148 136)", fontSize: "1.5rem", fontWeight: "bold" }}>Upcoming Tasks</h1>
            <div style={{ height: "50%" }}>
              <TaskList
                tasks={upcomingTasksData}
              />
            </div>

            <h1 style={{ color: "rgb(13 148 136)", fontSize: "1.5rem", fontWeight: "bold" }}>Past Tasks</h1>
            <div style={{ height: "50%" }}>
              <TaskList
                tasks={pastTasksData}
              />
            </div>

          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// DATA FETCHING
export async function getServerSideProps(context) {

  // Get url slug for profile page dynamically from url.
  const { id } = context.query;
  // console.log(id, 'ID');

  // User table profile data
  const user = await axios.get(`http://localhost:3000/api/users/${id}`);
  // console.log('userAddressId', user.data.user.addressId)
  // console.log( user.data.user.Organization, 'USER')

  // User address data
  // Address table profile data
  const userAddress = await axios.get(`http://localhost:3000/api/addresses/${user.data.user.addressId}`);
  // console.log(userAddress, 'userAddress')

  // Organization table profile data
  const userOrganizations = await prisma.user.findUnique({
    where: {
      id: user.data.user.id
    },
    include: {
      Organizations: true
    }
  });
  // console.log(user.data.user.id, 'user.data.user.id');
  // console.log(userOrganizations.Organizations, 'userOrganizations');

  // Task table profile data
  // Get tasks where offer is complete for user
  const userPastOffersComplete = await prisma.offer.findMany({
    where: {
      userId: parseInt(user.data.user.id),
      status: 'COMPLETE'
    }
  });
  // console.log('userPastOffersComplete', userPastOffersComplete);

  // Get all tasks data for user based on offers complete for the user
  const tasksArr = userPastOffersComplete.map((item) => {
    return axios.get(`http://localhost:3000/api/tasks/${item.taskId}`);
  });
  const res = await Promise.all(tasksArr);

  // Extract tasks data
  const tasksData = res.map((item) => {
    // console.log(item, 'ITEM');
    return item.data.task;
  });
  // console.log(tasksData, 'TASKS-DATA');

  // Get addresses with addressId from tasksData array
  const addressWithAddressIdArr = tasksData.map((task) => {
    // console.log(task.addressId, 'task.addressId')
    return axios.get(`http://localhost:3000/api/addresses/${task.addressId}`);
  });
  const resAddressWithAddressIdArr = await Promise.all(addressWithAddressIdArr);

  const addressWithAddressId = resAddressWithAddressIdArr.map((item) => {
    return item.data.address;
  });
  // console.log(addressWithAddressId, 'addressWithAddressId');

  tasksData.forEach((task) => {
    for (let i = 0; i < addressWithAddressId.length; i++) {
      if (task.addressId === addressWithAddressId[i].id) {
        task.city = addressWithAddressId[i].city;
      }
    }
  });

  const addresses = await prisma.address.findMany();
  addCoordsToTasks(tasksData, addresses);
  addCoordsToUser(user.data.user, addresses);
  addDistanceToTasks(tasksData, user.data.user);
  // console.log(tasksData, 'TASKS-DATA');

  // Extract upcoming tasks data
  const upcomingData = tasksData.filter(item => {
    return item.status === 'PENDING';
  });
  // console.log(upcomingData, 'upcomingData');

  // Extract past tasks data
  const pastData = tasksData.filter(item => {
    return item.status === 'COMPLETE';
  });
  // console.log(pastData, 'pastData');

  return {
    props: {
      user: user.data,
      userAddress: userAddress.data,
      userOrganizations: userOrganizations.Organizations,
      upcomingData,
      pastData
    }
  };
}