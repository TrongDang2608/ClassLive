const instructorService = require('../services/instructorService');

class InstructorController {
  async addStudent(req, res) {
    try {
      // Yêu cầu gốc là addStudent nhưng ta viết service hỗ trợ addUser để tạo được cả Instructor
      const result = await instructorService.addUser(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStudents(req, res) {
    try {
      // Mặc định lấy danh sách sinh viên theo yêu cầu, hoặc truyền query role
      const roleFilter = req.query.role || 'student';
      const result = await instructorService.getUsers(roleFilter);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudent(req, res) {
    try {
      const { identifier } = req.params; // Có thể là phone hoặc id
      const result = await instructorService.getUser(identifier);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async editStudent(req, res) {
    try {
      const { identifier } = req.params;
      const result = await instructorService.editUser(identifier, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const { identifier } = req.params;
      const result = await instructorService.deleteUser(identifier);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new InstructorController();
