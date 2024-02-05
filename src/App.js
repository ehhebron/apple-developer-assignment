import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import './App.scss';
import navigation from './navigation.json';

export default function App() {
  const [selectedCity, setSelectedCity] = useState(navigation.cities[0].section);
  const [tabWidth, setTabWidth] = useState('0px');
  const [tabPosition, setTabPosition] = useState('0px');
  const [animatedTransition, setAnimatedTransition] = useState(false);
  const [time, setTime] = useState(null);
  const [timezone, setTimezone] = useState(navigation.cities[0].timezone)

  const handleNewCitySelection = (event, newSelectedCity) => {
    // Check if there is no ongoing animation transition
    if (animatedTransition === false) {
      // If no ongoing animation, set animationTransition to true 
      setAnimatedTransition(true);
    }
    //Get the position and dimensions of the clicked element 
    const targetPosition = event.target.getBoundingClientRect();
    // Set the selected city, timezone, width, and position
    setSelectedCity(newSelectedCity.section);
    setTimezone(newSelectedCity.timezone);
    setTabWidth(targetPosition.width);
    setTabPosition(targetPosition.x);
  };

  // handle the tab's width and position
  const updateTab = () => {
    const selectedCityElementPosition = document.getElementById(selectedCity).getBoundingClientRect();
      setTabWidth(selectedCityElementPosition.width);
      setTabPosition(selectedCityElementPosition.x);
  };

  const formatTime = (hour, minutes) => {
    let ampm = "";
  
    if(hour === 0) {
      hour = 12;
      ampm = "AM";
    } else if(hour === 12) {
      ampm = "PM";
    } else if(hour > 12) {
      hour -= 12;
      ampm = "PM";
    } else {
      ampm = "AM";
    }
  
    if(hour.toString().length === 1) {
      hour = `0${hour}`;
    }
    
    if(minutes.toString().length === 1) {
      minutes = `0${minutes}`;
    }
  
    const formattedTime = `${hour}:${minutes} ${ampm}`;
    return formattedTime;
  }

  // Fetches the current time based on the specified timezone from a world time API 
  const updateLocalTime = async () => {
    try {
        const response = await fetch(`http://worldtimeapi.org/api/timezone/${timezone}/`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        const time = json.datetime.split("T")[1].split(".")[0];
        const [hour, minutes] = time.split(":");
        const formattedTime = formatTime(hour, minutes);
        setTime(formattedTime);
    } catch (error) {
        console.error("Error fetching time:", error.message);
        // Handle the error or log it appropriately
    }
};

  // Initialize component 
  useEffect(() => {
    updateTab();
    updateLocalTime();
  }, []);

  // Handles window resize events with a debounce 
  useEffect(() => {
    const handleWindowResize = debounce(() => {
      updateTab();
    }, 500);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  // Updates the local time when the timezone changes
  useEffect(() => {
    updateLocalTime();
  }, [timezone]);


  return (
   <>
    <section className="navigation">
      <nav>
        <ul>
         {navigation.cities.map((city) => (
            <li 
              className={`${selectedCity === city.section ? "selectedCity" : ""}`}
              id={city.section}
              key={city.section}
              onClick={(event) => handleNewCitySelection(event, city)}
            >
              {city.label}
            </li>
         ))} 
        </ul>
      </nav>
      <div className={`tab${animatedTransition ? " transition" : ""}`}
           style={{ width: tabWidth, left: tabPosition }}>
      </div>
    </section>
    <section className="time">
      <p>{time}</p>
    </section>
   </>
  );
}