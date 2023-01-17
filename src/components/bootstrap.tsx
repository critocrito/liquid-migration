import React, {useEffect, useState} from "react";
import Loader from "react-spinners/PacmanLoader";

const Bootstrap = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center border border-blue">
      <Loader
        color="#1f2937"
        loading={loading}
        size={25}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Bootstrap;
