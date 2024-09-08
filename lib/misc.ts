function stop({ error }) {
  console.error(error);
  process.exit(1);
}


export const misc = {
  stop,
};


export default misc;
