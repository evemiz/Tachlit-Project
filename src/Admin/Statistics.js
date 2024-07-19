import React, { useEffect, useState } from 'react';
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Statistics.css'; // Import the CSS file

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = ({ closeModal }) => {
  const [cityOpenRequestCounts, setCityOpenRequestCounts] = useState({});
  const [cityVolunteerCounts, setCityVolunteerCounts] = useState({});
  const [volunteeringFieldCounts, setVolunteeringFieldCounts] = useState({});
  const [highOpenRequestLowVolunteerCounts, setHighOpenRequestLowVolunteerCounts] = useState({});

  useEffect(() => {
    const fetchCityOpenRequestCounts = async () => {
      try {
        const aidRequestsSnapshot = await getDocs(collection(db, 'AidRequests'));
        const aidRequests = aidRequestsSnapshot.docs.map(doc => doc.data());

        const openRequestCounts = {};
        aidRequests.forEach(data => {
          if (data.city && data.status === 'open') {
            if (openRequestCounts[data.city]) {
              openRequestCounts[data.city]++;
            } else {
              openRequestCounts[data.city] = 1;
            }
          }
        });

        setCityOpenRequestCounts(openRequestCounts);

        return openRequestCounts;

      } catch (error) {
        console.error("Error fetching city open request counts: ", error);
      }
    };

    const fetchCityVolunteerCounts = async (openRequestCounts) => {
      try {
        const volunteersSnapshot = await getDocs(collection(db, 'Volunteers'));
        const volunteers = volunteersSnapshot.docs.map(doc => doc.data());

        const volunteerCounts = {};
        const fieldCounts = {
          'שינוע': 0,
          'ביקור חולים': 0,
          'הסעת חולים': 0,
          'אריזת מזון': 0,
          'התנדבות פיזית': 0,
          'התנדבות משרדית': 0,
        };

        volunteers.forEach(data => {
          if (data.city) {
            if (volunteerCounts[data.city]) {
              volunteerCounts[data.city]++;
            } else {
              volunteerCounts[data.city] = 1;
            }
          }

          if (data.volunteering) {
            data.volunteering.forEach(field => {
              if (fieldCounts[field] !== undefined) {
                fieldCounts[field]++;
              }
            });
          }
        });

        const nonEmptyVolunteerCounts = Object.fromEntries(Object.entries(volunteerCounts).filter(([_, count]) => count > 0));

        setCityVolunteerCounts(nonEmptyVolunteerCounts);
        setVolunteeringFieldCounts(fieldCounts);

        const highOpenRequestLowVolunteer = {};
        Object.keys(openRequestCounts).forEach(city => {
          const openRequestCount = openRequestCounts[city];
          const volunteerCount = volunteerCounts[city] || 0;
          const difference = openRequestCount - volunteerCount;
          if (difference > 0) {
            highOpenRequestLowVolunteer[city] = { openRequests: openRequestCount, volunteers: volunteerCount };
          }
        });

        const sortedDifferences = Object.entries(highOpenRequestLowVolunteer).sort((a, b) => (b[1].openRequests - b[1].volunteers) - (a[1].openRequests - a[1].volunteers));
        const topDifferences = sortedDifferences.slice(0, 10);
        const topHighOpenRequestLowVolunteerCounts = Object.fromEntries(topDifferences);

        setHighOpenRequestLowVolunteerCounts(topHighOpenRequestLowVolunteerCounts);

      } catch (error) {
        console.error("Error fetching city volunteer counts: ", error);
      }
    };

    const fetchData = async () => {
      const openRequestCounts = await fetchCityOpenRequestCounts();
      await fetchCityVolunteerCounts(openRequestCounts);
    };

    fetchData();
  }, []);

  const openRequestLabels = Object.keys(cityOpenRequestCounts);
  const openRequestData = {
    labels: openRequestLabels,
    datasets: [
      {
        label: 'מספר בקשות פתוחות',
        data: openRequestLabels.map(city => cityOpenRequestCounts[city]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const volunteerLabels = Object.keys(cityVolunteerCounts);
  const volunteerData = {
    labels: volunteerLabels,
    datasets: [
      {
        label: 'מספר מתנדבים',
        data: volunteerLabels.map(city => cityVolunteerCounts[city]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const fieldLabels = Object.keys(volunteeringFieldCounts);
  const fieldData = {
    labels: fieldLabels,
    datasets: [
      {
        label: 'מספר מתנדבים',
        data: fieldLabels.map(field => volunteeringFieldCounts[field]),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const highOpenRequestLowVolunteerLabels = Object.keys(highOpenRequestLowVolunteerCounts);
  const highOpenRequestLowVolunteerData = {
    labels: highOpenRequestLowVolunteerLabels,
    datasets: [
      {
        label: 'מספר בקשות פתוחות',
        data: highOpenRequestLowVolunteerLabels.map(city => highOpenRequestLowVolunteerCounts[city].openRequests),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'מספר מתנדבים',
        data: highOpenRequestLowVolunteerLabels.map(city => highOpenRequestLowVolunteerCounts[city].volunteers),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
  };

  return (
    <div className="statistics-grid">
      <button className="close-button" onClick={closeModal}>X</button>
      <div className="chart-container">
        <h2>מספר בקשות סיוע עבור כל עיר</h2>
        <Bar data={openRequestData} options={{ ...options, title: { text: 'מספר בקשות פתוחות מכל עיר' } }} />
      </div>
      <div className="chart-container">
        <h2>מספר מתנדבים מכל עיר</h2>
        <Bar data={volunteerData} options={{ ...options, title: { text: 'מספר מתנדבים מכל עיר' } }} />
      </div>
      <div className="chart-container">
        <h2>מספר מתנדבים לכל תחום התנדבות</h2>
        <Bar data={fieldData} options={{ ...options, title: { text: 'מספר מתנדבים לכל תחום התנדבות' } }} />
      </div>
      <div className="chart-container">
        <h2>פער בין בקשות פתוחות למתנדבים בכל עיר</h2>
        <Bar data={highOpenRequestLowVolunteerData} options={{ ...options, title: { text: 'פער בין בקשות פתוחות למתנדבים בכל עיר' } }} />
      </div>
    </div>
  );
};

export default Statistics;
