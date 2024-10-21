const db = require('../config/dbConnection');

// Obtener el tipo de cambio más reciente
const getTipoCambio = (callback) => {
const query = 'SELECT valor_cambio, fecha_cambio FROM tipo_cambio WHERE id_tipo_cambio = 1';
  db.query(query, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

// Actualizar el tipo de cambio
const updateTipoCambio = (nuevoValor, callback) => {
    const query = 'UPDATE tipo_cambio SET valor_cambio = ?, fecha_cambio = NOW() WHERE id_tipo_cambio = 1';
    db.query(query, [nuevoValor], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  };

module.exports = {
  getTipoCambio,
  updateTipoCambio
};
