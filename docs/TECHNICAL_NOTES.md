#include <windows.h>
#include <iostream>
#include <string>
#include "data/Db.h"
#include "util/Time.h"

int main() {
    std::wcout.imbue(std::locale(""));
    
    std::wcout << L"测试开始..." << std::endl;
    
    // 测试数据库初始化
    std::wcout << L"初始化数据库..." << std::endl;
    if (!data::Db::instance().initialize()) {
        std::wcout << L"数据库初始化失败!" << std::endl;
        return -1;
    }
    std::wcout << L"数据库初始化成功!" << std::endl;
    
    // 测试时间函数
    int today = util::localYyyymmdd();
    std::wcout << L"今天日期: " << today << std::endl;
    
    // 测试任务加载
    auto tasks = data::Db::instance().loadTasksForDay(today);
    std::wcout << L"今天的任务数量: " << tasks.size() << std::endl;
    
    // 测试插入任务
    data::Task testTask;
    testTask.yyyymmdd = today;
    testTask.title = L"测试任务";
    testTask.progress = 0;
    testTask.done = 0;
    testTask.ord = 0;
    
    if (data::Db::instance().insertTask(testTask)) {
        std::wcout << L"测试任务插入成功!" << std::endl;
    } else {
        std::wcout << L"测试任务插入失败!" << std::endl;
    }
    
    // 重新加载任务
    tasks = data::Db::instance().loadTasksForDay(today);
    std::wcout << L"插入后的任务数量: " << tasks.size() << std::endl;
    
    for (const auto& task : tasks) {
        std::wcout << L"任务: " << task.title << L" (进度: " << task.progress << L"%)" << std::endl;
    }
    
    std::wcout << L"测试完成，按任意键退出..." << std::endl;
    std::cin.get();
    
    return 0;
}
#include <windows.h>
#include <iostream>
#include <string>
#include "data/Db.h"
#include "util/Time.h"

int main() {
    std::wcout.imbue(std::locale(""));
    
    std::wcout << L"测试开始..." << std::endl;
    
    // 测试数据库初始化
    std::wcout << L"初始化数据库..." << std::endl;
    if (!data::Db::instance().initialize()) {
        std::wcout << L"数据库初始化失败!" << std::endl;
        return -1;
    }
    std::wcout << L"数据库初始化成功!" << std::endl;
    
    // 测试时间函数
    int today = util::localYyyymmdd();
    std::wcout << L"今天日期: " << today << std::endl;
    
    // 测试任务加载
    auto tasks = data::Db::instance().loadTasksForDay(today);
    std::wcout << L"今天的任务数量: " << tasks.size() << std::endl;
    
    // 测试插入任务
    data::Task testTask;
    testTask.yyyymmdd = today;
    testTask.title = L"测试任务";
    testTask.progress = 0;
    testTask.done = 0;
    testTask.ord = 0;
    
    if (data::Db::instance().insertTask(testTask)) {
        std::wcout << L"测试任务插入成功!" << std::endl;
    } else {
        std::wcout << L"测试任务插入失败!" << std::endl;
    }
    
    // 重新加载任务
    tasks = data::Db::instance().loadTasksForDay(today);
    std::wcout << L"插入后的任务数量: " << tasks.size() << std::endl;
    
    for (const auto& task : tasks) {
        std::wcout << L"任务: " << task.title << L" (进度: " << task.progress << L"%)" << std::endl;
    }
    
    std::wcout << L"测试完成，按任意键退出..." << std::endl;
    std::cin.get();
    
    return 0;
}
