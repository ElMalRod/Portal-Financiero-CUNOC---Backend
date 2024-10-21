const TipocambioModel = require('../models/TipocambioModel');

// Obtener el tipo de cambio actual
const getTipoCambio = (req, res) => {
    TipocambioModel.getTipoCambio((err, tipoCambio) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el tipo de cambio' });
    }
    res.json(tipoCambio);
  });
};

// Actualizar el tipo de cambio
const updateTipoCambio = (req, res) => {
  const { nuevoValor } = req.body;

  if (!nuevoValor || isNaN(nuevoValor)) {
    return res.status(400).json({ error: 'Por favor, proporciona un valor numérico válido para el tipo de cambio' });
  }

  TipocambioModel.updateTipoCambio(nuevoValor, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el tipo de cambio' });
    }
    res.json({ message: 'Tipo de cambio actualizado correctamente', nuevoValor });
  });
};

module.exports = {
  getTipoCambio,
  updateTipoCambio
};
