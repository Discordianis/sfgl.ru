import React, { useEffect, useState } from 'react';

const CurrentFridayPerson: React.FC = () => {
    const [currentPerson, setCurrentPerson] = useState('');
    const people = ['Корж', 'Бэтти', 'Засос', 'Кот', 'Ханжа'];

    const getNextFridays = (years: number) => {
        const fridays: { date: Date, person: string }[] = [];
        const current = new Date('2024-09-28');

        while (current.getDay() !== 5) {
            current.setDate(current.getDate() + 1);
        }

        let personIndex = 0;

        while (current.getFullYear() <= new Date().getFullYear() + years) {
            fridays.push({ date: new Date(current), person: people[personIndex] });
            current.setDate(current.getDate() + 7);
            personIndex = (personIndex + 1) % people.length;
        }

        return fridays;
    };

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fridays = getNextFridays(100);

        const nextFriday = fridays.find(friday =>
            today <= friday.date
        );

        if (nextFriday) {
            setCurrentPerson(nextFriday.person);
        } else {
            setCurrentPerson('Неизвестно');
        }
    }, []);

    return (
        <div>
            <span>Ответственный за следующую пятницу: <strong>{currentPerson}</strong></span>
            <br />
            <span>Ответственный будет обновлён в следующую субботу</span>
            <br />
            <br />
            <span>Список всех ответственных за пятницы осуществляется по следующему порядку:</span>
            {people.map((p, index) => (
                <span key={index}><br/>{index + 1}. {p} </span>
            ))}
        </div>
    );
};

export default CurrentFridayPerson;
