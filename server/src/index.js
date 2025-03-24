import app from './app.js';

const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default server;
