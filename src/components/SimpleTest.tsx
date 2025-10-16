"use client";

export default function SimpleTest() {
  return (
    <button 
      onClick={() => alert('Button works!')}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      TEST BUTTON - CLICK ME
    </button>
  );
}
