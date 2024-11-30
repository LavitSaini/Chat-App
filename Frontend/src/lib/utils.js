import moment from "moment";

// Format mongodb createdAt field and extract correct fromat of time
export function formatTime(createdAt){
   const date = new Date(createdAt);
   return moment(date).format('hh:mm A');
}