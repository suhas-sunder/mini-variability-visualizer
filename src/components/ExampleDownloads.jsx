const ExampleDownloads = () => {
  const samples = [
    { name: "Automotive System", file: "sample-automotive.json" },
    {
      name: "Complex Infusion System",
      file: "sample-complex-infusion-system.json",
    },
    { name: "IoT Device Suite", file: "sample-iot.json" },
    { name: "Medical Device Model", file: "sample-medical.json" },
    { name: "1000 Node Example", file: "1000-node-example.json" },
    { name: "3000 Node Example", file: "3000-node-example.json" },
    { name: "10,000 Node Example", file: "10-000-node-example.json" },
  ];

  return (
    <div className="w-full max-w-3xl mt-6 p-5 rounded-xl bg-gray-950 border text-center border-gray-800 shadow-md">
      <h3 className="text-gray-100 font-semibold mb-3 flex items-center justify-center gap-2">
        Download Sample Feature Models
      </h3>

      <p className="text-gray-300 text-sm mb-4">
        You can download any of the sample models below, then upload them above.
      </p>

      <ul className="space-y-2 text-sm">
        {samples.map((item) => (
          <li key={item.file}>
            <a
              href={`/${item.file}`}
              download
              className="flex items-center justify-between bg-gray-900 border border-gray-800 
                         px-4 py-2.5 rounded-md text-gray-100 cursor-pointer 
                         hover:bg-gray-800 transition-colors"
            >
              <span className="text-white">{item.name}</span>
              <span className="text-blue-300 text-xs font-mono">Download</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleDownloads;
