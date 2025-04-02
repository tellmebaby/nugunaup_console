import React from 'react';

export default function Widget1() {
  return (
    <div className="flex flex-col items-center p-2.5 gap-0.5 w-full h-full bg-white rounded-lg">
      {/* Title */}
      <div className="flex flex-col justify-center items-center w-full h-[30px] border-b border-black">
        <div className="flex justify-center items-center w-full h-[18px]">
          <span className="font-normal text-sm flex items-center text-center text-black">
            Service Status
          </span>
        </div>
      </div>

      {/* Table Rows */}
      {/* Row 1: Total Users */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Total Users
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[210px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            3,500 users (+ 25 from yesterday)
          </span>
        </div>
      </div>

      {/* Row 2: New Members */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            New Members
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Today: 51
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Month: 280
          </span>
        </div>
      </div>

      {/* Row 3: Active Users */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Active Users
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Today: 32
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Month: 430
          </span>
        </div>
      </div>

      {/* Row 4: Listed Properties */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Properties
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[210px] h-4">
          <div className="flex justify-between w-full">
            <span className="text-[10px] flex items-center text-center text-black">
              Today: 400
            </span>
            <span className="text-[10px] flex items-center text-center text-black">
              Month: 840
            </span>
          </div>
        </div>
      </div>

      {/* Row 5: Successful Bids */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Successful Bids
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Today: 39
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[105px] h-4">
          <span className="text-[10px] flex items-center text-center text-black">
            Month: 289
          </span>
        </div>
      </div>

      {/* Row 6: Bid Amount */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Bid Amount
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[210px] h-4">
          <div className="flex justify-between w-full">
            <span className="text-[10px] flex items-center text-center text-black">
              Month: 3.2B won
            </span>
            <span className="text-[10px] flex items-center text-center text-black">
              Total: 7.5B won
            </span>
          </div>
        </div>
      </div>

      {/* Row 7: Rewards */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Rewards
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[210px] h-4">
          <div className="flex justify-between w-full">
            <span className="text-[10px] flex items-center text-center text-black">
              Month: 0.6B won
            </span>
            <span className="text-[10px] flex items-center text-center text-black">
              Total: 2.2B won
            </span>
          </div>
        </div>
      </div>

      {/* Row 8: Fees */}
      <div className="flex flex-row justify-between items-center w-full h-4 mt-1">
        <div className="flex justify-center items-center p-0.5 w-[60px] h-4 bg-[#E8E7E7]">
          <span className="text-[10px] flex items-center text-center text-black">
            Fees
          </span>
        </div>
        <div className="flex justify-center items-center p-0.5 w-[210px] h-4">
          <div className="flex justify-between w-full">
            <span className="text-[10px] flex items-center text-center text-black">
              Month: 1.5B won
            </span>
            <span className="text-[10px] flex items-center text-center text-black">
              Total: 6.5B won
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}