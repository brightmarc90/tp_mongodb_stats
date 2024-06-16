// Compter le nombre total de documents dans la collection sales.
db.sales.aggregate([
    {
        $group: {
            _id: null,
            "Total des transactions": {
                $sum: 1
            }
        }
    }
])
// Donnez le total des ventes quotidiennes.
db.sales.aggregate([
    {
        $group: {
            _id: "$date",
            "Total des ventes": {
                $sum: "$total_amount"
            }
        }
    },
    {
        $sort: { // tri par date pour avoir des dates croissantes
            "_id": 1
        }
    }
])
// Donnez le total des ventes pour chaque produit.
db.sales.aggregate([
    {
        $group: {
            _id: "$product_id",
            "Total des ventes": {
                $sum: "$total_amount"
            }
        }
    },
    {
        $sort: {
            "Total des ventes": 1
        }
    }
])
// Identifiez les 5 produits avec le plus grand nombre de transactions.
db.sales.aggregate([
    {
        $group: {
            _id: "$product_id",
            "Total des transactions": {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            "Total des transactions": -1
        }
    },
    {
        $limit: 5
    }
])
// Calculez le revenu moyen par transaction.
db.sales.aggregate([
    {
        $group: {
            _id: null,
            "Revenu moyen": {
                $avg: "$total_amount"
            }
        }
    }
])
// Comptez le nombre de clients uniques ayant effectué au moins une transaction.
db.sales.aggregate([
    {
        $group: {
            _id: "$customer_id",
            "nbtransac": { // comptage du nombre de transaction par client
                $sum: 1
            }
        }
    },
    {
        $match: { // filtre sur les nombre de transaction >= à 1
            "nbtransac": { $gte: 1 }
        }
    },
    {
        $project: {
            "Client": "$_id",
            "_id": 0,
            "Nombre de transactions": "$nbtransac"
        }
    }
])
// Donnez la répartition des ventes pour chaque magasin.
db.sales.aggregate([
    {
        $group: { // grouper par magasin pour calculer le nombre de transactions et le total de ventes 
            _id: "$store_id",
            "nbtransac": {
                $sum: 1
            },
            "totalRevenu": {
                $sum: "$total_amount"
            }
        }
    },
    {
        $group: { // grouper sur null pour calculer la total des ventes tous magasins confondus
            _id: null,
            stores: { // stockage dans un tableau des données de chaque magasin
                $push: {
                    store_id: "$_id",
                    totalTransac: "$nbtransac",
                    totalRevenus: "$totalRevenu"
                }
            },
            totalTransacAll: { $sum: "$nbtransac" },
            totalRevenusAll: { $sum: "$totalRevenu" }
        }
    },
    {
        $unwind: '$stores'
    },
    {
        $project: {
            "Magasin": "$stores.store_id",
            "_id": 0,
            "Total des transactions": "$stores.totalTransac",
            "Repartition des transactions(%)": { $multiply: [{ $divide: ["$stores.totalTransac", "$totalTransacAll"] }, 100] },
            "Total des ventes": "$stores.totalRevenus",
            "Repartition des revenus (%)": { $multiply: [{ $divide: ["$stores.totalRevenus", "$totalRevenusAll"] }, 100] }
        }
    }
])