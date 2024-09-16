function stop(msg) {
  if (msg) console.error(msg);
  process.exit(1);
}


export const misc = {
  stop,
};


export default misc;
