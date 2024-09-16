function stop({ error }) {
  if (error) console.error(error);
  process.exit(1);
}


export const misc = {
  stop,
};


export default misc;
