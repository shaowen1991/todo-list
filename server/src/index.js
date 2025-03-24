import app from './app.js';

const PORT = process.env.PORT;
// eslint-disable-next-line no-console
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default server;
