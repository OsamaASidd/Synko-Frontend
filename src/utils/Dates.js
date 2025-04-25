



const lastFiveDaysSDate = () => {
    const lastFiveDays = new Date();
    lastFiveDays.setDate(lastFiveDays.getDate() - 5);

    // Format the date as MM/DD/YY
    const formattedDate = `${lastFiveDays.getFullYear()}-${(lastFiveDays.getMonth() + 1).toString().padStart(2, '0')}-${lastFiveDays.getDate().toString().padStart(2, '0')}T${lastFiveDays.getHours().toString().padStart(2, '0')}:${lastFiveDays.getMinutes().toString().padStart(2, '0')}`;

    return formattedDate
}


const todayDate = () => {
    const today = new Date();

    // Format today's date as 'YYYY-MM-DDTHH:MM'
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate
}



const extractDateTimeInfo = (dateTimeStr)=>{
    // Parse the date string into a Date object
    var dateObj = new Date(dateTimeStr);
    // Extract individual components
    var hours = dateObj.getHours();
    var minutes = dateObj.getMinutes();
    var day = dateObj.getDate();
    var month = dateObj.getMonth() + 1; // Adding 1 since getUTCMonth() returns zero-based month
    var year = dateObj.getFullYear();

    return { hours: hours, minutes: minutes, day: day, month: month, year: year };
}




export { lastFiveDaysSDate, todayDate, extractDateTimeInfo }




