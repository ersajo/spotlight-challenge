const run = (req, res) => {
  res.status(201).json({text: 'Test'});
}

module.exports = {
  run
};