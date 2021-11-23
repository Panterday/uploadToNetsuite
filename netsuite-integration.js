/**
 * @typedef OrdenCompraResponse
 * @property {bool} existe verdadero (true) si la orden de compra existe.
 * @property {string} moneda nombre de la moneda.
 * @property {string} montoTotal total de la factura.
 */

/**
 * 
 * @param {Object} request 
 * @param {string} realm 
 * @param {string} consumer_key 
 * @param {string} consumer_secret 
 * @param {string} token 
 * @param {string} token_secret 
 * @param {('1'|'256')} [sha=256] default 256
 * @returns {{Authorization: string}} 
 */
const oauth10 = (request, realm, consumer_key, consumer_secret,
  token, token_secret, sha = '256') => {
  const oauth1a = require('oauth-1.0a');
  const crypto = require('crypto');

  const oauth = oauth1a({
    realm,
    nonce_length: 11,
    consumer: { key: consumer_key, secret: consumer_secret },
    signature_method: 'HMAC-SHA' + sha,
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha' + sha, key)
        .update(base_string)
        .digest('base64')
    },
  })

  const authorization = oauth.authorize(request, {
    key: token,
    secret: token_secret,
  });

  return oauth.toHeader(authorization);
}

/**
 * 
 * @param {string} oc Número de Orden de Compra
 * @param {ProveedorModel|Number} prov proveedor o id de proveedor
 * @param {Object} empresa datos de la empresa en sesión
 * @param {Number} empresa.id id de la empresa
 * @param {string} empresa.rfc RFC de la empresa
 * @param {string} empresa.razon Razón Social de la empresa
 * @returns {Promise<OrdenCompraResponse>} JSON de Respuesta del servicio
 */
const validateOrdenCompra = async (oc, prov, empresa) => {
  const fetch = require("node-fetch");
  const { ProveedorModel, NetsuiteModuleModel,
    CodigoProveedorModel } = require("../api/models");
  const { id_erp: idProveedor } = typeof prov === 'number' ?
    await CodigoProveedorModel.query()
      .findOne({ 'proveedor_id': prov, erp: 'NetSuite' }) :
    await prov.$fetchGraph('netsuite', { skipFetched: true });
  const { script, deploy, instancia, realm,
    consumer_key, consumer_secret,
    token, token_secret } = await NetsuiteModuleModel.query()
      .findOne({ empresa_id: empresa.id });
  const params = [
    ['script', script],
    ['deploy', deploy],
    ['numeroOc', oc],
    ['idProveedor', idProveedor]
  ];
  const url =
    new URL(`https://${instancia}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`);
  params.forEach(param => url.searchParams.set(...param));
  const { Authorization } = oauth10({
    url: url.toString(),
    method: 'GET'
  }, realm, consumer_key, consumer_secret, token, token_secret);
  const config = {
    method: 'GET',
    headers: {
      Authorization,
      Cookie: 'NS_ROUTING_VERSION=LAGGING',
    },
    redirect: 'follow'
  };
  const response = await fetch(url, config);
  return response.status === 200 ?
    { success: true, status: 200, data: await response.json() } :
    { error: true, status: response.status, description: await response.text() };
}

module.exports = {
  oauth10,
  validateOrdenCompra
}