import express from 'express';
import { Sequelize, DataTypes, Op } from 'sequelize';

const app = express();
const port = 5000;

const sequelize = new Sequelize('sqlite::memory:');

let User, Role, Position, Department, Project;

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Соединение с БД есть');
    } catch (e) {
        console.log('Соединения с БД нету', e);
        return;
    }

    Position = sequelize.define(
        'Должность', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'Должность',
        timestamps: false,
    });

    Role = sequelize.define(
        'Роль', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'Роль',
        timestamps: false,
    });

    Department = sequelize.define(
        'Отдел', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'Отдел',
        timestamps: false,
    });

    Project = sequelize.define(
        'Проект', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'Проект',
        timestamps: false,
    });

    User = sequelize.define(
        'Пользователь', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        roleId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Роль',
                key: 'id',
            },
        },
        positionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Должность',
                key: 'id',
            },
        },
        departmentId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Отдел',
                key: 'id',
            },
        },
    }, {
        tableName: 'Пользователь',
        timestamps: false,
    });

    // Установка ассоциаций (связей между таблицами)
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
    User.belongsTo(Position, { foreignKey: 'positionId', as: 'Position' });
    User.belongsTo(Department, { foreignKey: 'departmentId', as: 'Department' });
    
    Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });
    Position.hasMany(User, { foreignKey: 'positionId', as: 'Users' });
    Department.hasMany(User, { foreignKey: 'departmentId', as: 'Users' });

    await sequelize.sync({ force: true });
    console.log('Все таблицы созданы');

    await Position.bulkCreate([
        { name: 'Разработчик' },
        { name: 'Тестировщик' },
        { name: 'Аналитик' },
        { name: 'Менеджер проекта' },
        { name: 'Дизайнер' }
    ]);

    await Role.bulkCreate([
        { name: 'Администратор' },
        { name: 'Модератор' },
        { name: 'Пользователь' },
        { name: 'Гость' },
        { name: 'Редактор' }
    ]);

    await Department.bulkCreate([
        { name: 'IT отдел' },
        { name: 'Отдел разработки' },
        { name: 'Отдел тестирования' },
        { name: 'Отдел аналитики' },
        { name: 'Отдел дизайна' }
    ]);

    await Project.bulkCreate([
        { name: 'Веб-сайт компании' },
        { name: 'Мобильное приложение' },
        { name: 'Внутренняя система учета' },
        { name: 'Облачное хранилище' },
        { name: 'Система аналитики' }
    ]);

    await User.bulkCreate([
        {
            name: 'Иван Петров',
            email: 'ivan.petrov@company.com',
            roleId: 1,
            positionId: 1,
            departmentId: 1
        },
        {
            name: 'Мария Сидорова',
            email: 'maria.sidorova@company.com',
            roleId: 2,
            positionId: 2,
            departmentId: 3
        },
        {
            name: 'Алексей Козлов',
            email: 'alexey.kozlov@company.com',
            roleId: 3,
            positionId: 3,
            departmentId: 4
        },
        {
            name: 'Елена Волкова',
            email: 'elena.volkova@company.com',
            roleId: 4,
            positionId: 4,
            departmentId: 2
        },
        {
            name: 'Дмитрий Орлов',
            email: 'dmitry.orlov@company.com',
            roleId: 5,
            positionId: 5,
            departmentId: 5
        }
    ]);

    console.log('Таблицы успешно заполнены тестовыми данными');
    
    console.log('Пользователи с ролью "Пользователь":');
    const usersWithUserRole = await User.findAll({
        where: { roleId: 3 },
        include: [{ model: Role, as: 'Role' }]
    });
    console.log(usersWithUserRole.map(user => ({
        id: user.id,
        name: user.name,
        role: user.Role.name
    })));

    console.log('Пользователи из IT отдела или отдела разработки:');
    const usersFromITOrDev = await User.findAll({
        where: {
            [Op.or]: [
                { departmentId: 1 },
                { departmentId: 2 }
            ]
        },
        include: [{ model: Department, as: 'Department' }]
    });
    console.log(usersFromITOrDev.map(user => ({
        id: user.id,
        name: user.name,
        department: user.Department.name
    })));

    console.log(' Пользователи-аналитики из отдела аналитики:');
    const analystsFromAnalytics = await User.findAll({
        where: {
            [Op.and]: [
                { roleId: 3 },
                { departmentId: 4 }
            ]
        },
        include: [{ model: Role, as: 'Role' }, { model: Department, as: 'Department' }]
    });
    console.log(analystsFromAnalytics.map(user => ({
        id: user.id,
        name: user.name,
        role: user.Role.name,
        department: user.Department.name
    })));

    console.log(' Пользователи отсортированные по имени:');
    const usersSortedByName = await User.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'email']
    });
    console.log(usersSortedByName.map(user => user.toJSON()));

    console.log(' Изменение одной записи:');
    const [updatedCount] = await User.update(
        { email: 'ivan.new@company.com' },
        { where: { id: 1 } }
    );
    console.log(`Обновлено записей: ${updatedCount}`);
    
    const updatedUser = await User.findByPk(1);
    console.log('Обновленный пользователь:', updatedUser.toJSON());

    console.log(' Изменение нескольких записей:');
    const [bulkUpdatedCount] = await User.update(
        { departmentId: 1 },
        { where: { id: [2, 3] } }
    );
    console.log(`Обновлено записей: ${bulkUpdatedCount}`);
    
    const bulkUpdatedUsers = await User.findAll({
        where: { id: [2, 3] },
        attributes: ['id', 'name', 'departmentId']
    });
    console.log('Обновленные пользователи:', bulkUpdatedUsers.map(user => user.toJSON()));

    console.log('\ Удаление записи:');
    const deletedCount = await User.destroy({
        where: { id: 5 }
    });
    console.log(`Удалено записей: ${deletedCount}`);

    console.log(' Пользователи с email содержащим "company":');
    const usersWithCompanyEmail = await User.findAll({
        where: {
            email: {
                [Op.like]: '%company%'
            }
        },
        attributes: ['id', 'name', 'email']
    });
    console.log(usersWithCompanyEmail.map(user => user.toJSON()));

    console.log('Пользователи с id от 1 до 3:');
    const usersWithIdRange = await User.findAll({
        where: {
            id: {
                [Op.between]: [1, 3]
            }
        },
        attributes: ['id', 'name', 'email']
    });
    console.log(usersWithIdRange.map(user => user.toJSON()));

    console.log(' Все пользователи после изменений:');
    const allUsers = await User.findAll({
        include: [
            { model: Role, as: 'Role' },
            { model: Position, as: 'Position' },
            { model: Department, as: 'Department' }
        ],
        order: [['id', 'ASC']]
    });
    console.log(allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        position: user.Position.name,
        department: user.Department.name
    })));
}

initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Сервер порт: ${port}`);
        console.log(`Страница логина: http://localhost:${port}/`);
    });
}).catch(error => {
    console.error('Ошибка при инициализации БД:', error);
});