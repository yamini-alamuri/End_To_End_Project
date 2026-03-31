import { useState, useEffect } from 'react';
import { Zap, Phone, Mail, MapPin, Calendar, Star, Award, X } from 'lucide-react';

const ElectriciansTab = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const electricians = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91-9876540001',
      email: 'rajesh.electrician@gmail.com',
      experience: 15,
      specialization: 'Solar Panel Installation',
      rating: 4.9,
      reviews: 124,
      location: 'Hyderabad',
      certifications: 'Licensed Electrician, MNRE Certified Installer',
      availability: 'Mon-Sat, 9 AM - 6 PM'
    },
    {
      id: 2,
      name: 'Suresh Reddy',
      phone: '+91-9876540002',
      email: 'suresh.solar@gmail.com',
      experience: 12,
      specialization: 'Solar Inverter & Battery Setup',
      rating: 4.8,
      reviews: 98,
      location: 'Bangalore',
      certifications: 'Licensed Electrician, Solar PV Specialist',
      availability: 'Mon-Fri, 10 AM - 7 PM'
    },
    {
      id: 3,
      name: 'Venkat Rao',
      phone: '+91-9876540003',
      email: 'venkat.electric@gmail.com',
      experience: 10,
      specialization: 'Rooftop Solar Installation',
      rating: 4.7,
      reviews: 86,
      location: 'Chennai',
      certifications: 'Licensed Electrician, IEC Certified',
      availability: 'Mon-Sat, 8 AM - 5 PM'
    },
    {
      id: 4,
      name: 'Prakash Sharma',
      phone: '+91-9876540004',
      email: 'prakash.solar@gmail.com',
      experience: 18,
      specialization: 'Commercial Solar Systems',
      rating: 4.9,
      reviews: 156,
      location: 'Mumbai',
      certifications: 'Licensed Electrician, MNRE Certified, ISO Trained',
      availability: 'All days, 9 AM - 6 PM'
    },
    {
      id: 5,
      name: 'Anil Gupta',
      phone: '+91-9876540005',
      email: 'anil.electrician@gmail.com',
      experience: 8,
      specialization: 'Residential Solar Installation',
      rating: 4.6,
      reviews: 72,
      location: 'Delhi',
      certifications: 'Licensed Electrician, Solar Technician Certified',
      availability: 'Mon-Sat, 10 AM - 6 PM'
    }
  ];

  const [selectedElectrician, setSelectedElectrician] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleBookAppointment = (electrician) => {
    setSelectedElectrician(electrician);
    setShowModal(true);
  };

  const submitAppointment = (e) => {
    e.preventDefault();
    const newAppointment = {
      id: Date.now(),
      electrician: selectedElectrician,
      date: appointmentDate,
      time: appointmentTime,
      notes: notes,
      status: 'Confirmed',
      bookedAt: new Date().toISOString()
    };
    setMyAppointments([...myAppointments, newAppointment]);
    showNotification(`✅ Appointment successfully booked with ${selectedElectrician.name} for ${appointmentDate} at ${appointmentTime}!`, 'success');
    setShowModal(false);
    setAppointmentDate('');
    setAppointmentTime('');
    setNotes('');
  };

  const cancelAppointment = (appointmentId) => {
    const appointment = myAppointments.find(apt => apt.id === appointmentId);
    if (window.confirm(`Are you sure you want to cancel the appointment with ${appointment.electrician.name}?`)) {
      setMyAppointments(myAppointments.filter(apt => apt.id !== appointmentId));
      showNotification(`🔴 Appointment with ${appointment.electrician.name} has been cancelled.`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-24 right-6 z-50 animate-slide-in-right ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 max-w-md`}>
          <span className="text-lg font-semibold">{toastMessage}</span>
          <button onClick={() => setShowToast(false)} className="ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* My Appointments Section */}
      {myAppointments.length > 0 && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-bold mb-4 text-indigo-900">📅 My Appointments</h3>
          <div className="space-y-3">
            {myAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 bg-white rounded-lg border-l-4 border-indigo-500 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{appointment.electrician.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {appointment.electrician.location}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">Notes: {appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {appointment.status}
                    </span>
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Zap className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Licensed Electricians</h2>
            <p className="text-lg opacity-90">Book appointments with certified solar installation experts</p>
          </div>
        </div>
      </div>

      {/* Electricians List */}
      <div className="grid gap-6">
        {electricians.map((electrician) => (
          <div
            key={electrician.id}
            className="card hover:shadow-2xl transition-all duration-300 border-l-4 border-yellow-500"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{electrician.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{electrician.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{electrician.location}</span>
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                      {electrician.specialization}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-bold">{electrician.rating}</span>
                    <span className="text-sm text-gray-600">({electrician.reviews})</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{electrician.certifications}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Available: {electrician.availability}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{electrician.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{electrician.email}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 md:w-56 flex flex-col justify-center space-y-3">
                <button
                  onClick={() => handleBookAppointment(electrician)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => handleCall(electrician.phone)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/*Appointment model*/}
      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Book Appointment with {selectedElectrician?.name}</h3>

            <form onSubmit={submitAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Date *</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Time *</label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field h-24"
                  placeholder="Describe your solar installation requirements..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectriciansTab;
