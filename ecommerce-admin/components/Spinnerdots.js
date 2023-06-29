import { SyncLoader } from "react-spinners";

const Spinnerdots = ({ fullWidth }) => {
    if(fullWidth){
        return (
            <div className="w-full flex justify-center">
                     <SyncLoader speedMultiplier={1} color={'#1E3A8A'} />
            </div>
        )
    }
    return (
     
        <SyncLoader speedMultiplier={1} color={'#1E3A8A'} />
     
    );
  };
  
  export default Spinnerdots;
  