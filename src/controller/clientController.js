const Client = require("../models/Client");

const createClient = async (req, res) => {
  try {
    const { name, phones } = req.body;
    if (!name || !phones || !Array.isArray(phones) || phones.length === 0) {
      return res
        .status(400)
        .json({ error: "Name and phones array are required" });
    }
    const client = new Client({ name, phones });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create client", details: error.message });
  }
};

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [clients, total] = await Promise.all([
      Client.find(searchQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      Client.countDocuments(searchQuery)
    ]);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalClients: total
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients", details: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch client" });
  }
};

const updateClient = async (req, res) => {
  try {
    const { name, phones } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, phones },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to update client" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete client" });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
